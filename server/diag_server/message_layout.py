# SPDX-License-Identifier: AGPL-3.0-only
from copy import deepcopy
from dataclasses import dataclass, field, is_dataclass
from types import MethodType
from typing import Any

from odxtools.decodestate import DecodeState
from odxtools.dopbase import DopBase
from odxtools.encoding import Encoding
from odxtools.environmentdatadescription import EnvironmentDataDescription
from odxtools.field import Field
from odxtools.multiplexer import Multiplexer
from odxtools.nameditemlist import NamedItemList
from odxtools.odxtypes import AtomicOdxType, DataType
from odxtools.parameters.parameter import Parameter
from odxtools.request import Request
from odxtools.response import Response


@dataclass
class _ParameterTrace:
    path: str
    source: Any
    short_name: str
    node_type: str
    parent_path: str | None
    dop_type: str | None = None
    related_parameter_path: str | None = None
    ranges: list[dict[str, int]] = field(default_factory=list)
    physical_value: Any = None
    children: list['_ParameterTrace'] = field(default_factory=list)


@dataclass
class _DopFrame:
    dop: DopBase
    trace: _ParameterTrace
    item_index: int = 0
    key_value: Any = None
    key_path: str | None = None


def _bit_ranges(
    byte_position: int, bit_position: int, bit_length: int, reverse_bytes: bool
) -> list[dict[str, int]]:
    byte_length = (bit_position + bit_length + 7) // 8
    padding = byte_length * 8 - bit_position - bit_length
    positions = sorted(
        byte_position * 8
        + ((byte_length - 1 - offset // 8) if reverse_bytes else offset // 8) * 8
        + offset % 8
        for offset in range(padding, padding + bit_length)
    )
    ranges: list[dict[str, int]] = []
    for position in positions:
        if ranges and ranges[-1]["start_bit"] + ranges[-1]["bit_length"] == position:
            ranges[-1]["bit_length"] += 1
        else:
            ranges.append({"start_bit": position, "bit_length": 1})
    return ranges


@dataclass
class _LayoutDecodeState(DecodeState):
    active_parameters: list[_ParameterTrace] = field(default_factory=list)
    traces: list[_ParameterTrace] = field(default_factory=list)
    active_dops: list[_DopFrame] = field(default_factory=list)

    def extract_atomic_value(
        self,
        *,
        bit_length: int,
        base_data_type: DataType,
        base_type_encoding: Encoding | None,
        is_highlow_byte_order: bool,
    ) -> AtomicOdxType:
        byte_position = self.cursor_byte_position
        bit_position = self.cursor_bit_position
        value = super().extract_atomic_value(
            bit_length=bit_length,
            base_data_type=base_data_type,
            base_type_encoding=base_type_encoding,
            is_highlow_byte_order=is_highlow_byte_order,
        )
        if self.active_parameters:
            reverse_bytes = not is_highlow_byte_order and base_data_type in (
                DataType.A_INT32, DataType.A_UINT32, DataType.A_FLOAT32, DataType.A_FLOAT64
            )
            self.active_parameters[-1].ranges.extend(
                _bit_ranges(byte_position, bit_position, bit_length, reverse_bytes)
            )
        return value


def _merge_ranges(ranges: list[dict[str, int]]) -> list[dict[str, int]]:
    merged: list[dict[str, int]] = []
    for item in sorted(ranges, key=lambda item: item['start_bit']):
        end = item['start_bit'] + item['bit_length']
        if merged and merged[-1]['start_bit'] + merged[-1]['bit_length'] >= item['start_bit']:
            merged[-1]['bit_length'] = max(
                merged[-1]['start_bit'] + merged[-1]['bit_length'], end
            ) - merged[-1]['start_bit']
        elif item['bit_length']:
            merged.append(dict(item))
    return merged


def _new_trace(
    state: _LayoutDecodeState,
    source: Any,
    segment: str,
    short_name: str,
    node_type: str,
    dop: DopBase | None = None,
    related_parameter_path: str | None = None,
) -> _ParameterTrace:
    parent = state.active_parameters[-1] if state.active_parameters else None
    path = (
        f'{parent.path}{segment}' if segment.startswith('[')
        else f'{parent.path}.{segment}'
    ) if parent else segment
    base_path = path
    occurrence = 1
    paths = {trace.path for trace in state.traces}
    while path in paths:
        path = f'{base_path}[{occurrence}]'
        occurrence += 1
    trace = _ParameterTrace(
        path=path,
        source=source,
        short_name=short_name,
        node_type=node_type,
        parent_path=parent.path if parent else None,
        dop_type=type(dop).__name__ if dop is not None else None,
        related_parameter_path=related_parameter_path,
    )
    if parent:
        parent.children.append(trace)
    state.traces.append(trace)
    return trace


def _discard_trace(state: _LayoutDecodeState, trace: _ParameterTrace) -> None:
    discarded = {id(trace)}
    for child in trace.children:
        _discard_trace(state, child)
    state.traces[:] = [item for item in state.traces if id(item) not in discarded]
    for parent in state.active_parameters:
        parent.children[:] = [item for item in parent.children if item is not trace]


def _finish_trace(state: _LayoutDecodeState, trace: _ParameterTrace) -> None:
    if trace.ranges and trace.children:
        value = _new_trace(state, trace.source, '$value', 'Encoded value', 'value')
        value.ranges = trace.ranges
        trace.ranges = []
    trace.ranges = _merge_ranges(trace.ranges + [
        item for child in trace.children for item in child.ranges
    ])


def _instrument_parameter(parameter: Parameter) -> None:
    original_decode = parameter.decode_from_pdu

    def decode_with_layout(bound_parameter: Parameter, state: _LayoutDecodeState) -> Any:
        dop = getattr(bound_parameter, 'dop', None)
        trace = _new_trace(
            state, bound_parameter, bound_parameter.short_name,
            bound_parameter.short_name, 'parameter', dop,
        )
        byte_position = (
            state.origin_byte_position + bound_parameter.byte_position
            if bound_parameter.byte_position is not None else state.cursor_byte_position
        )
        state.active_parameters.append(trace)
        try:
            trace.physical_value = original_decode(state)
            if not trace.ranges and not trace.children:
                bit_length = bound_parameter.get_static_bit_length()
                if bit_length is not None:
                    trace.ranges = _bit_ranges(
                        byte_position, bound_parameter.bit_position or 0, bit_length, False
                    )
            _finish_trace(state, trace)
            return trace.physical_value
        except Exception:
            _discard_trace(state, trace)
            raise
        finally:
            state.active_parameters.pop()

    vars(parameter)["decode_from_pdu"] = MethodType(decode_with_layout, parameter)


def _dop_trace(state: _LayoutDecodeState, dop: DopBase) -> _ParameterTrace:
    parent = state.active_parameters[-1]
    frame = state.active_dops[-1] if state.active_dops else None
    source = parent.source
    table_key = getattr(source, 'table_key', None)
    if table_key is not None:
        row = state.table_keys.get(table_key.short_name) or table_key.table_row
        if row is not None:
            key_path = next((
                item.path for item in reversed(state.traces)
                if item.source is table_key or getattr(item.source, 'odx_id', None) == table_key.odx_id
            ), None)
            return _new_trace(state, dop, row.short_name, row.short_name, 'row', dop, key_path)
    if frame is not None and frame.trace is parent:
        if isinstance(frame.dop, Field):
            if dop is getattr(frame.dop, '_structure', None):
                index = frame.item_index
                frame.item_index += 1
                return _new_trace(state, dop, f'[{index}]', f'[{index}] {dop.short_name}', 'item', dop)
            if dop is getattr(frame.dop, 'dyn_end_dop', None):
                return _new_trace(state, dop, '$end_marker', 'End marker', 'end_marker', dop)
            return _new_trace(state, dop, '$length', 'Number of items', 'length', dop)
        if isinstance(frame.dop, Multiplexer):
            if dop is frame.dop.switch_key.dop:
                return _new_trace(state, dop, '$switch_key', 'Switch key', 'switch_key', dop)
            selected = next((
                case for case in frame.dop.cases
                if frame.dop._get_case_limits(case)[0] <= frame.key_value <= frame.dop._get_case_limits(case)[1]
            ), frame.dop.default_case)
            if selected is not None:
                return _new_trace(state, dop, selected.short_name, selected.short_name, 'case', dop, frame.key_path)
        if isinstance(frame.dop, EnvironmentDataDescription):
            reference = frame.dop.param_snref
            key_path = next((item.path for item in reversed(state.traces) if getattr(item.source, 'short_name', None) == reference), None)
            return _new_trace(state, dop, dop.short_name, dop.short_name, 'environment_data', dop, key_path)
    return _new_trace(state, dop, dop.short_name, dop.short_name, 'dop', dop)


def _instrument_dop(dop: DopBase) -> None:
    original_decode = dop.decode_from_pdu

    def decode_with_layout(bound_dop: DopBase, state: _LayoutDecodeState) -> Any:
        parent = state.active_parameters[-1]
        enclosing_frame = state.active_dops[-1] if state.active_dops else None
        reuse_parent = isinstance(parent.source, Parameter) and getattr(parent.source, 'dop', None) is bound_dop
        trace = parent if reuse_parent else _dop_trace(state, bound_dop)
        frame = _DopFrame(dop=bound_dop, trace=trace)
        if not reuse_parent:
            state.active_parameters.append(trace)
        state.active_dops.append(frame)
        try:
            value = original_decode(state)
            trace.physical_value = value
            if trace.node_type == 'end_marker' and enclosing_frame is not None:
                if value != getattr(enclosing_frame.dop, 'termination_value', None):
                    _discard_trace(state, trace)
                    return value
            if trace.node_type == 'switch_key' and enclosing_frame is not None:
                enclosing_frame.key_value = value
                enclosing_frame.key_path = trace.path
            if isinstance(bound_dop, Multiplexer) and isinstance(value, tuple):
                case_name = value[0]
                if isinstance(case_name, str) and not any(
                    child.node_type == 'case' for child in trace.children
                ):
                    _new_trace(
                        state,
                        bound_dop,
                        case_name,
                        case_name,
                        'case',
                        related_parameter_path=frame.key_path,
                    )
            if not reuse_parent:
                _finish_trace(state, trace)
            return value
        except Exception:
            if not reuse_parent:
                _discard_trace(state, trace)
            raise
        finally:
            state.active_dops.pop()
            if not reuse_parent:
                state.active_parameters.pop()

    vars(dop)['decode_from_pdu'] = MethodType(decode_with_layout, dop)


def trace_message_layout(message: Request | Response, coded_message: bytes | bytearray) -> list[dict[str, Any]]:
    """Trace an isolated ODX graph; shared definitions and decoder methods are never modified."""
    traced_message = deepcopy(message)
    visited: set[int] = set()

    def instrument(value: Any) -> None:
        if id(value) in visited:
            return
        visited.add(id(value))
        if isinstance(value, Parameter):
            _instrument_parameter(value)
        elif isinstance(value, DopBase):
            _instrument_dop(value)
        if is_dataclass(value) and not isinstance(value, type):
            for attribute_value in list(vars(value).values()):
                instrument(attribute_value)
        elif isinstance(value, dict):
            for item in value.values():
                instrument(item)
        elif isinstance(value, (list, tuple, NamedItemList)):
            for item in value:
                instrument(item)

    instrument(traced_message)
    state = _LayoutDecodeState(coded_message=bytes(coded_message))
    traced_message.decode_from_pdu(state)
    return [
        {
            "path": trace.path,
            "short_name": trace.short_name,
            "parameter_type": type(trace.source).__name__,
            "parent_path": trace.parent_path,
            "node_type": trace.node_type,
            "dop_type": trace.dop_type,
            "related_parameter_path": trace.related_parameter_path,
            "physical_value": trace.physical_value,
            "ranges": trace.ranges,
        }
        for trace in state.traces
    ]
