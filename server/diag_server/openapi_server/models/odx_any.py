# SPDX-License-Identifier: AGPL-3.0-only
from datetime import date, datetime  # noqa: F401

from typing import List, Dict  # noqa: F401

from diag_server.openapi_server.models.base_model import Model
from diag_server.openapi_server.models.additional_audience import AdditionalAudience
from diag_server.openapi_server.models.addrdef_filter import AddrdefFilter
from diag_server.openapi_server.models.addrdef_phys_segment import AddrdefPhysSegment
from diag_server.openapi_server.models.addressing import Addressing
from diag_server.openapi_server.models.admin_data import AdminData
from diag_server.openapi_server.models.audience import Audience
from diag_server.openapi_server.models.audience_resolved import AudienceResolved
from diag_server.openapi_server.models.base_comparam import BaseComparam
from diag_server.openapi_server.models.base_function_node import BaseFunctionNode
from diag_server.openapi_server.models.base_function_node_resolved import BaseFunctionNodeResolved
from diag_server.openapi_server.models.base_variant import BaseVariant
from diag_server.openapi_server.models.base_variant_pattern import BaseVariantPattern
from diag_server.openapi_server.models.base_variant_raw import BaseVariantRaw
from diag_server.openapi_server.models.base_variant_raw_diag_variables_raw_inner import BaseVariantRawDiagVariablesRawInner
from diag_server.openapi_server.models.basic_structure import BasicStructure
from diag_server.openapi_server.models.checksum import Checksum
from diag_server.openapi_server.models.coded_const_parameter import CodedConstParameter
from diag_server.openapi_server.models.comm_relation import CommRelation
from diag_server.openapi_server.models.comm_relation_resolved import CommRelationResolved
from diag_server.openapi_server.models.comm_relation_value_type import CommRelationValueType
from diag_server.openapi_server.models.company_data1 import CompanyData1
from diag_server.openapi_server.models.company_doc_info import CompanyDocInfo
from diag_server.openapi_server.models.company_doc_info_resolved import CompanyDocInfoResolved
from diag_server.openapi_server.models.company_revision_info import CompanyRevisionInfo
from diag_server.openapi_server.models.company_revision_info_resolved import CompanyRevisionInfoResolved
from diag_server.openapi_server.models.company_specific_info import CompanySpecificInfo
from diag_server.openapi_server.models.comparam import Comparam
from diag_server.openapi_server.models.comparam_instance import ComparamInstance
from diag_server.openapi_server.models.comparam_instance_resolved import ComparamInstanceResolved
from diag_server.openapi_server.models.comparam_instance_value_any_of_inner import ComparamInstanceValueAnyOfInner
from diag_server.openapi_server.models.comparam_resolved import ComparamResolved
from diag_server.openapi_server.models.comparam_spec import ComparamSpec
from diag_server.openapi_server.models.comparam_subset import ComparamSubset
from diag_server.openapi_server.models.complex_comparam import ComplexComparam
from diag_server.openapi_server.models.complex_dop import ComplexDop
from diag_server.openapi_server.models.component_connector import ComponentConnector
from diag_server.openapi_server.models.component_connector_resolved import ComponentConnectorResolved
from diag_server.openapi_server.models.compu_category import CompuCategory
from diag_server.openapi_server.models.compu_code_compu_method import CompuCodeCompuMethod
from diag_server.openapi_server.models.compu_const import CompuConst
from diag_server.openapi_server.models.compu_default_value import CompuDefaultValue
from diag_server.openapi_server.models.compu_internal_to_phys import CompuInternalToPhys
from diag_server.openapi_server.models.compu_method import CompuMethod
from diag_server.openapi_server.models.compu_phys_to_internal import CompuPhysToInternal
from diag_server.openapi_server.models.compu_rational_coeffs import CompuRationalCoeffs
from diag_server.openapi_server.models.compu_rational_coeffs_numerators_inner import CompuRationalCoeffsNumeratorsInner
from diag_server.openapi_server.models.compu_scale import CompuScale
from diag_server.openapi_server.models.config_data import ConfigData
from diag_server.openapi_server.models.config_data_dictionary_spec import ConfigDataDictionarySpec
from diag_server.openapi_server.models.config_id_item import ConfigIdItem
from diag_server.openapi_server.models.config_id_item_resolved import ConfigIdItemResolved
from diag_server.openapi_server.models.config_item import ConfigItem
from diag_server.openapi_server.models.config_item_resolved import ConfigItemResolved
from diag_server.openapi_server.models.config_record import ConfigRecord
from diag_server.openapi_server.models.data_id_item import DataIdItem
from diag_server.openapi_server.models.data_id_item_resolved import DataIdItemResolved
from diag_server.openapi_server.models.data_object_property import DataObjectProperty
from diag_server.openapi_server.models.data_object_property_resolved import DataObjectPropertyResolved
from diag_server.openapi_server.models.data_record import DataRecord
from diag_server.openapi_server.models.data_type import DataType
from diag_server.openapi_server.models.datablock import Datablock
from diag_server.openapi_server.models.datablock_resolved import DatablockResolved
from diag_server.openapi_server.models.datafile import Datafile
from diag_server.openapi_server.models.dataformat import Dataformat
from diag_server.openapi_server.models.dataformat_selection import DataformatSelection
from diag_server.openapi_server.models.description import Description
from diag_server.openapi_server.models.determine_number_of_items import DetermineNumberOfItems
from diag_server.openapi_server.models.determine_number_of_items_resolved import DetermineNumberOfItemsResolved
from diag_server.openapi_server.models.diag_class_type import DiagClassType
from diag_server.openapi_server.models.diag_coded_type import DiagCodedType
from diag_server.openapi_server.models.diag_comm import DiagComm
from diag_server.openapi_server.models.diag_comm_data_connector import DiagCommDataConnector
from diag_server.openapi_server.models.diag_comm_resolved import DiagCommResolved
from diag_server.openapi_server.models.diag_data_dictionary_spec import DiagDataDictionarySpec
from diag_server.openapi_server.models.diag_layer import DiagLayer
from diag_server.openapi_server.models.diag_layer_container import DiagLayerContainer
from diag_server.openapi_server.models.diag_layer_raw import DiagLayerRaw
from diag_server.openapi_server.models.diag_layer_raw_diag_comms_raw_inner import DiagLayerRawDiagCommsRawInner
from diag_server.openapi_server.models.diag_layer_type import DiagLayerType
from diag_server.openapi_server.models.diag_object_connector import DiagObjectConnector
from diag_server.openapi_server.models.diag_service import DiagService
from diag_server.openapi_server.models.diag_service_resolved import DiagServiceResolved
from diag_server.openapi_server.models.diag_variable import DiagVariable
from diag_server.openapi_server.models.diag_variable_resolved import DiagVariableResolved
from diag_server.openapi_server.models.diagnostic_trouble_code import DiagnosticTroubleCode
from diag_server.openapi_server.models.direction import Direction
from diag_server.openapi_server.models.doc_revision import DocRevision
from diag_server.openapi_server.models.doc_revision_resolved import DocRevisionResolved
from diag_server.openapi_server.models.doc_type import DocType
from diag_server.openapi_server.models.dop_base import DopBase
from diag_server.openapi_server.models.dtc_connector import DtcConnector
from diag_server.openapi_server.models.dtc_connector_resolved import DtcConnectorResolved
from diag_server.openapi_server.models.dtc_dop import DtcDop
from diag_server.openapi_server.models.dtc_dop_dtcs_raw_inner import DtcDopDtcsRawInner
from diag_server.openapi_server.models.dyn_defined_spec import DynDefinedSpec
from diag_server.openapi_server.models.dyn_end_dop_ref import DynEndDopRef
from diag_server.openapi_server.models.dyn_id_def_mode_info import DynIdDefModeInfo
from diag_server.openapi_server.models.dyn_id_def_mode_info_resolved import DynIdDefModeInfoResolved
from diag_server.openapi_server.models.dyn_id_def_mode_info_selection_table_refs_inner import DynIdDefModeInfoSelectionTableRefsInner
from diag_server.openapi_server.models.dynamic_endmarker_field import DynamicEndmarkerField
from diag_server.openapi_server.models.dynamic_endmarker_field_resolved import DynamicEndmarkerFieldResolved
from diag_server.openapi_server.models.dynamic_length_field import DynamicLengthField
from diag_server.openapi_server.models.dynamic_length_field_resolved import DynamicLengthFieldResolved
from diag_server.openapi_server.models.dynamic_parameter import DynamicParameter
from diag_server.openapi_server.models.ecu_config import EcuConfig
from diag_server.openapi_server.models.ecu_group import EcuGroup
from diag_server.openapi_server.models.ecu_mem import EcuMem
from diag_server.openapi_server.models.ecu_mem_connector import EcuMemConnector
from diag_server.openapi_server.models.ecu_mem_connector_resolved import EcuMemConnectorResolved
from diag_server.openapi_server.models.ecu_mem_connector_resolved_layers_inner import EcuMemConnectorResolvedLayersInner
from diag_server.openapi_server.models.ecu_proxy import EcuProxy
from diag_server.openapi_server.models.ecu_shared_data import EcuSharedData
from diag_server.openapi_server.models.ecu_shared_data_raw import EcuSharedDataRaw
from diag_server.openapi_server.models.ecu_variant import EcuVariant
from diag_server.openapi_server.models.ecu_variant_pattern import EcuVariantPattern
from diag_server.openapi_server.models.ecu_variant_raw import EcuVariantRaw
from diag_server.openapi_server.models.encoding import Encoding
from diag_server.openapi_server.models.encrypt_compress_method import EncryptCompressMethod
from diag_server.openapi_server.models.encrypt_compress_method_type import EncryptCompressMethodType
from diag_server.openapi_server.models.end_of_pdu_field import EndOfPduField
from diag_server.openapi_server.models.end_of_pdu_field_resolved import EndOfPduFieldResolved
from diag_server.openapi_server.models.env_data_connector import EnvDataConnector
from diag_server.openapi_server.models.env_data_connector_resolved import EnvDataConnectorResolved
from diag_server.openapi_server.models.environment_data import EnvironmentData
from diag_server.openapi_server.models.environment_data_description import EnvironmentDataDescription
from diag_server.openapi_server.models.expected_ident import ExpectedIdent
from diag_server.openapi_server.models.extern_flashdata import ExternFlashdata
from diag_server.openapi_server.models.external_access_method import ExternalAccessMethod
from diag_server.openapi_server.models.external_doc import ExternalDoc
from diag_server.openapi_server.models.field import Field
from diag_server.openapi_server.models.field_resolved import FieldResolved
from diag_server.openapi_server.models.filter import Filter
from diag_server.openapi_server.models.flash import Flash
from diag_server.openapi_server.models.flash_class import FlashClass
from diag_server.openapi_server.models.flashdata import Flashdata
from diag_server.openapi_server.models.function_diag_comm_connector import FunctionDiagCommConnector
from diag_server.openapi_server.models.function_diag_comm_connector_resolved import FunctionDiagCommConnectorResolved
from diag_server.openapi_server.models.function_dictionary import FunctionDictionary
from diag_server.openapi_server.models.function_in_param import FunctionInParam
from diag_server.openapi_server.models.function_in_param_resolved import FunctionInParamResolved
from diag_server.openapi_server.models.function_node import FunctionNode
from diag_server.openapi_server.models.function_node_group import FunctionNodeGroup
from diag_server.openapi_server.models.function_node_group_resolved import FunctionNodeGroupResolved
from diag_server.openapi_server.models.function_node_resolved import FunctionNodeResolved
from diag_server.openapi_server.models.function_out_param import FunctionOutParam
from diag_server.openapi_server.models.function_out_param_resolved import FunctionOutParamResolved
from diag_server.openapi_server.models.functional_class import FunctionalClass
from diag_server.openapi_server.models.functional_group import FunctionalGroup
from diag_server.openapi_server.models.functional_group_raw import FunctionalGroupRaw
from diag_server.openapi_server.models.gateway_logical_link import GatewayLogicalLink
from diag_server.openapi_server.models.gateway_logical_link_resolved import GatewayLogicalLinkResolved
from diag_server.openapi_server.models.group_member import GroupMember
from diag_server.openapi_server.models.group_member_resolved import GroupMemberResolved
from diag_server.openapi_server.models.hierarchy_element import HierarchyElement
from diag_server.openapi_server.models.hierarchy_element_raw import HierarchyElementRaw
from diag_server.openapi_server.models.ident_desc import IdentDesc
from diag_server.openapi_server.models.ident_value import IdentValue
from diag_server.openapi_server.models.ident_value_type import IdentValueType
from diag_server.openapi_server.models.identical_compu_method import IdenticalCompuMethod
from diag_server.openapi_server.models.identifiable_element import IdentifiableElement
from diag_server.openapi_server.models.info_component import InfoComponent
from diag_server.openapi_server.models.info_component_type import InfoComponentType
from diag_server.openapi_server.models.input_param import InputParam
from diag_server.openapi_server.models.intern_flashdata import InternFlashdata
from diag_server.openapi_server.models.internal_constr import InternalConstr
from diag_server.openapi_server.models.interval_type import IntervalType
from diag_server.openapi_server.models.iso_tp import IsoTp
from diag_server.openapi_server.models.item_value import ItemValue
from diag_server.openapi_server.models.leading_length_info_type import LeadingLengthInfoType
from diag_server.openapi_server.models.length_key_parameter import LengthKeyParameter
from diag_server.openapi_server.models.length_key_parameter_resolved import LengthKeyParameterResolved
from diag_server.openapi_server.models.library import Library
from diag_server.openapi_server.models.limit import Limit
from diag_server.openapi_server.models.limit_value import LimitValue
from diag_server.openapi_server.models.linear_compu_method import LinearCompuMethod
from diag_server.openapi_server.models.linear_segment import LinearSegment
from diag_server.openapi_server.models.link_comparam_ref import LinkComparamRef
from diag_server.openapi_server.models.linked_dtc_dop import LinkedDtcDop
from diag_server.openapi_server.models.linked_dtc_dop_resolved import LinkedDtcDopResolved
from diag_server.openapi_server.models.logical_link import LogicalLink
from diag_server.openapi_server.models.logical_link_resolved import LogicalLinkResolved
from diag_server.openapi_server.models.logical_link_type import LogicalLinkType
from diag_server.openapi_server.models.matching_base_variant_parameter import MatchingBaseVariantParameter
from diag_server.openapi_server.models.matching_component import MatchingComponent
from diag_server.openapi_server.models.matching_component_resolved import MatchingComponentResolved
from diag_server.openapi_server.models.matching_parameter import MatchingParameter
from diag_server.openapi_server.models.matching_request_parameter import MatchingRequestParameter
from diag_server.openapi_server.models.mem import Mem
from diag_server.openapi_server.models.member_logical_link import MemberLogicalLink
from diag_server.openapi_server.models.member_logical_link_resolved import MemberLogicalLinkResolved
from diag_server.openapi_server.models.min_max_length_type import MinMaxLengthType
from diag_server.openapi_server.models.model_year import ModelYear
from diag_server.openapi_server.models.modification import Modification
from diag_server.openapi_server.models.multiple_ecu_job import MultipleEcuJob
from diag_server.openapi_server.models.multiple_ecu_job_resolved import MultipleEcuJobResolved
from diag_server.openapi_server.models.multiple_ecu_job_spec import MultipleEcuJobSpec
from diag_server.openapi_server.models.multiplexer import Multiplexer
from diag_server.openapi_server.models.multiplexer_case import MultiplexerCase
from diag_server.openapi_server.models.multiplexer_case_resolved import MultiplexerCaseResolved
from diag_server.openapi_server.models.multiplexer_default_case import MultiplexerDefaultCase
from diag_server.openapi_server.models.multiplexer_default_case_resolved import MultiplexerDefaultCaseResolved
from diag_server.openapi_server.models.multiplexer_switch_key import MultiplexerSwitchKey
from diag_server.openapi_server.models.multiplexer_switch_key_resolved import MultiplexerSwitchKeyResolved
from diag_server.openapi_server.models.named_element import NamedElement
from diag_server.openapi_server.models.neg_offset import NegOffset
from diag_server.openapi_server.models.neg_output_param import NegOutputParam
from diag_server.openapi_server.models.negative_response_codes import NegativeResponseCodes
from diag_server.openapi_server.models.nrc_const_parameter import NrcConstParameter
from diag_server.openapi_server.models.odx_category import OdxCategory
from diag_server.openapi_server.models.odx_doc_context import OdxDocContext
from diag_server.openapi_server.models.odx_doc_fragment import OdxDocFragment
from diag_server.openapi_server.models.odx_link_id import OdxLinkId
from diag_server.openapi_server.models.odx_link_ref import OdxLinkRef
from diag_server.openapi_server.models.oem import Oem
from diag_server.openapi_server.models.option_item import OptionItem
from diag_server.openapi_server.models.option_item_resolved import OptionItemResolved
from diag_server.openapi_server.models.output_param import OutputParam
from diag_server.openapi_server.models.own_ident import OwnIdent
from diag_server.openapi_server.models.param_length_info_type import ParamLengthInfoType
from diag_server.openapi_server.models.param_length_info_type_resolved import ParamLengthInfoTypeResolved
from diag_server.openapi_server.models.parameter import Parameter
from diag_server.openapi_server.models.parameter_with_dop import ParameterWithDOP
from diag_server.openapi_server.models.parameter_with_dop_resolved import ParameterWithDOPResolved
from diag_server.openapi_server.models.parent_ref import ParentRef
from diag_server.openapi_server.models.parent_ref_resolved import ParentRefResolved
from diag_server.openapi_server.models.phys_mem import PhysMem
from diag_server.openapi_server.models.phys_segment import PhysSegment
from diag_server.openapi_server.models.physical_constant_parameter import PhysicalConstantParameter
from diag_server.openapi_server.models.physical_constant_parameter_resolved import PhysicalConstantParameterResolved
from diag_server.openapi_server.models.physical_dimension import PhysicalDimension
from diag_server.openapi_server.models.physical_type import PhysicalType
from diag_server.openapi_server.models.physical_vehicle_link import PhysicalVehicleLink
from diag_server.openapi_server.models.physical_vehicle_link_resolved import PhysicalVehicleLinkResolved
from diag_server.openapi_server.models.pin_type import PinType
from diag_server.openapi_server.models.pos_offset import PosOffset
from diag_server.openapi_server.models.pos_response_suppressible import PosResponseSuppressible
from diag_server.openapi_server.models.pre_condition_state_ref import PreConditionStateRef
from diag_server.openapi_server.models.prog_code import ProgCode
from diag_server.openapi_server.models.prog_code_resolved import ProgCodeResolved
from diag_server.openapi_server.models.prot_stack import ProtStack
from diag_server.openapi_server.models.prot_stack_resolved import ProtStackResolved
from diag_server.openapi_server.models.protocol import Protocol
from diag_server.openapi_server.models.protocol_raw import ProtocolRaw
from diag_server.openapi_server.models.protocol_raw_resolved import ProtocolRawResolved
from diag_server.openapi_server.models.radix import Radix
from diag_server.openapi_server.models.rat_func_compu_method import RatFuncCompuMethod
from diag_server.openapi_server.models.rat_func_segment import RatFuncSegment
from diag_server.openapi_server.models.read_diag_comm_connector import ReadDiagCommConnector
from diag_server.openapi_server.models.read_diag_comm_connector_resolved import ReadDiagCommConnectorResolved
from diag_server.openapi_server.models.read_param_value import ReadParamValue
from diag_server.openapi_server.models.related_diag_comm_ref import RelatedDiagCommRef
from diag_server.openapi_server.models.related_doc import RelatedDoc
from diag_server.openapi_server.models.request import Request
from diag_server.openapi_server.models.reserved_parameter import ReservedParameter
from diag_server.openapi_server.models.response import Response
from diag_server.openapi_server.models.response_type import ResponseType
from diag_server.openapi_server.models.row_fragment import RowFragment
from diag_server.openapi_server.models.sid import SID
from diag_server.openapi_server.models.scale_constr import ScaleConstr
from diag_server.openapi_server.models.scale_linear_compu_method import ScaleLinearCompuMethod
from diag_server.openapi_server.models.scale_rat_func_compu_method import ScaleRatFuncCompuMethod
from diag_server.openapi_server.models.security import Security
from diag_server.openapi_server.models.segment import Segment
from diag_server.openapi_server.models.session import Session
from diag_server.openapi_server.models.session_desc import SessionDesc
from diag_server.openapi_server.models.session_desc_resolved import SessionDescResolved
from diag_server.openapi_server.models.session_resolved import SessionResolved
from diag_server.openapi_server.models.session_sub_elem_type import SessionSubElemType
from diag_server.openapi_server.models.single_ecu_job import SingleEcuJob
from diag_server.openapi_server.models.single_ecu_job_resolved import SingleEcuJobResolved
from diag_server.openapi_server.models.sizedef_filter import SizedefFilter
from diag_server.openapi_server.models.sizedef_phys_segment import SizedefPhysSegment
from diag_server.openapi_server.models.special_data import SpecialData
from diag_server.openapi_server.models.special_data_group import SpecialDataGroup
from diag_server.openapi_server.models.special_data_group_caption import SpecialDataGroupCaption
from diag_server.openapi_server.models.special_data_group_values_inner import SpecialDataGroupValuesInner
from diag_server.openapi_server.models.standard_length_type import StandardLengthType
from diag_server.openapi_server.models.standardization_level import StandardizationLevel
from diag_server.openapi_server.models.state import State
from diag_server.openapi_server.models.state_chart import StateChart
from diag_server.openapi_server.models.state_chart_resolved import StateChartResolved
from diag_server.openapi_server.models.state_machine import StateMachine
from diag_server.openapi_server.models.state_transition import StateTransition
from diag_server.openapi_server.models.state_transition_ref import StateTransitionRef
from diag_server.openapi_server.models.static_field import StaticField
from diag_server.openapi_server.models.static_field_resolved import StaticFieldResolved
from diag_server.openapi_server.models.structure import Structure
from diag_server.openapi_server.models.sub_component import SubComponent
from diag_server.openapi_server.models.sub_component_param_connector import SubComponentParamConnector
from diag_server.openapi_server.models.sub_component_param_connector_resolved import SubComponentParamConnectorResolved
from diag_server.openapi_server.models.sub_component_pattern import SubComponentPattern
from diag_server.openapi_server.models.sw_variable import SwVariable
from diag_server.openapi_server.models.system_item import SystemItem
from diag_server.openapi_server.models.system_item_resolved import SystemItemResolved
from diag_server.openapi_server.models.system_parameter import SystemParameter
from diag_server.openapi_server.models.system_parameter_resolved import SystemParameterResolved
from diag_server.openapi_server.models.tab_intp_compu_method import TabIntpCompuMethod
from diag_server.openapi_server.models.table import Table
from diag_server.openapi_server.models.table_diag_comm_connector import TableDiagCommConnector
from diag_server.openapi_server.models.table_diag_comm_connector_resolved import TableDiagCommConnectorResolved
from diag_server.openapi_server.models.table_entry_parameter import TableEntryParameter
from diag_server.openapi_server.models.table_entry_parameter_resolved import TableEntryParameterResolved
from diag_server.openapi_server.models.table_key_parameter import TableKeyParameter
from diag_server.openapi_server.models.table_key_parameter_resolved import TableKeyParameterResolved
from diag_server.openapi_server.models.table_resolved import TableResolved
from diag_server.openapi_server.models.table_row import TableRow
from diag_server.openapi_server.models.table_row_connector import TableRowConnector
from diag_server.openapi_server.models.table_row_connector_resolved import TableRowConnectorResolved
from diag_server.openapi_server.models.table_row_resolved import TableRowResolved
from diag_server.openapi_server.models.table_struct_parameter import TableStructParameter
from diag_server.openapi_server.models.table_struct_parameter_resolved import TableStructParameterResolved
from diag_server.openapi_server.models.table_table_rows_raw_inner import TableTableRowsRawInner
from diag_server.openapi_server.models.target_addr_offset import TargetAddrOffset
from diag_server.openapi_server.models.team_member import TeamMember
from diag_server.openapi_server.models.termination import Termination
from diag_server.openapi_server.models.text import Text
from diag_server.openapi_server.models.texttable_compu_method import TexttableCompuMethod
from diag_server.openapi_server.models.trans_mode import TransMode
from diag_server.openapi_server.models.udssid import UDSSID
from diag_server.openapi_server.models.unit import Unit
from diag_server.openapi_server.models.unit_group import UnitGroup
from diag_server.openapi_server.models.unit_group_category import UnitGroupCategory
from diag_server.openapi_server.models.unit_group_resolved import UnitGroupResolved
from diag_server.openapi_server.models.unit_resolved import UnitResolved
from diag_server.openapi_server.models.unit_spec import UnitSpec
from diag_server.openapi_server.models.usage import Usage
from diag_server.openapi_server.models.valid_base_variant import ValidBaseVariant
from diag_server.openapi_server.models.valid_base_variant_resolved import ValidBaseVariantResolved
from diag_server.openapi_server.models.valid_type import ValidType
from diag_server.openapi_server.models.validity_for import ValidityFor
from diag_server.openapi_server.models.value_parameter import ValueParameter
from diag_server.openapi_server.models.value_parameter_resolved import ValueParameterResolved
from diag_server.openapi_server.models.variable_group import VariableGroup
from diag_server.openapi_server.models.variant_pattern1 import VariantPattern1
from diag_server.openapi_server.models.vehicle_connector import VehicleConnector
from diag_server.openapi_server.models.vehicle_connector_pin import VehicleConnectorPin
from diag_server.openapi_server.models.vehicle_info_spec import VehicleInfoSpec
from diag_server.openapi_server.models.vehicle_information import VehicleInformation
from diag_server.openapi_server.models.vehicle_information_resolved import VehicleInformationResolved
from diag_server.openapi_server.models.vehicle_model import VehicleModel
from diag_server.openapi_server.models.vehicle_type import VehicleType
from diag_server.openapi_server.models.write_diag_comm_connector import WriteDiagCommConnector
from diag_server.openapi_server.models.write_diag_comm_connector_resolved import WriteDiagCommConnectorResolved
from diag_server.openapi_server.models.x_doc import XDoc
from diag_server.openapi_server import util

from diag_server.openapi_server.models.additional_audience import AdditionalAudience  # noqa: E501
from diag_server.openapi_server.models.addrdef_filter import AddrdefFilter  # noqa: E501
from diag_server.openapi_server.models.addrdef_phys_segment import AddrdefPhysSegment  # noqa: E501
from diag_server.openapi_server.models.addressing import Addressing  # noqa: E501
from diag_server.openapi_server.models.admin_data import AdminData  # noqa: E501
from diag_server.openapi_server.models.audience import Audience  # noqa: E501
from diag_server.openapi_server.models.audience_resolved import AudienceResolved  # noqa: E501
from diag_server.openapi_server.models.base_comparam import BaseComparam  # noqa: E501
from diag_server.openapi_server.models.base_function_node import BaseFunctionNode  # noqa: E501
from diag_server.openapi_server.models.base_function_node_resolved import BaseFunctionNodeResolved  # noqa: E501
from diag_server.openapi_server.models.base_variant import BaseVariant  # noqa: E501
from diag_server.openapi_server.models.base_variant_pattern import BaseVariantPattern  # noqa: E501
from diag_server.openapi_server.models.base_variant_raw import BaseVariantRaw  # noqa: E501
from diag_server.openapi_server.models.base_variant_raw_diag_variables_raw_inner import BaseVariantRawDiagVariablesRawInner  # noqa: E501
from diag_server.openapi_server.models.basic_structure import BasicStructure  # noqa: E501
from diag_server.openapi_server.models.checksum import Checksum  # noqa: E501
from diag_server.openapi_server.models.coded_const_parameter import CodedConstParameter  # noqa: E501
from diag_server.openapi_server.models.comm_relation import CommRelation  # noqa: E501
from diag_server.openapi_server.models.comm_relation_resolved import CommRelationResolved  # noqa: E501
from diag_server.openapi_server.models.comm_relation_value_type import CommRelationValueType  # noqa: E501
from diag_server.openapi_server.models.company_data1 import CompanyData1  # noqa: E501
from diag_server.openapi_server.models.company_doc_info import CompanyDocInfo  # noqa: E501
from diag_server.openapi_server.models.company_doc_info_resolved import CompanyDocInfoResolved  # noqa: E501
from diag_server.openapi_server.models.company_revision_info import CompanyRevisionInfo  # noqa: E501
from diag_server.openapi_server.models.company_revision_info_resolved import CompanyRevisionInfoResolved  # noqa: E501
from diag_server.openapi_server.models.company_specific_info import CompanySpecificInfo  # noqa: E501
from diag_server.openapi_server.models.comparam import Comparam  # noqa: E501
from diag_server.openapi_server.models.comparam_instance import ComparamInstance  # noqa: E501
from diag_server.openapi_server.models.comparam_instance_resolved import ComparamInstanceResolved  # noqa: E501
from diag_server.openapi_server.models.comparam_instance_value_any_of_inner import ComparamInstanceValueAnyOfInner  # noqa: E501
from diag_server.openapi_server.models.comparam_resolved import ComparamResolved  # noqa: E501
from diag_server.openapi_server.models.comparam_spec import ComparamSpec  # noqa: E501
from diag_server.openapi_server.models.comparam_subset import ComparamSubset  # noqa: E501
from diag_server.openapi_server.models.complex_comparam import ComplexComparam  # noqa: E501
from diag_server.openapi_server.models.complex_dop import ComplexDop  # noqa: E501
from diag_server.openapi_server.models.component_connector import ComponentConnector  # noqa: E501
from diag_server.openapi_server.models.component_connector_resolved import ComponentConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.compu_category import CompuCategory  # noqa: E501
from diag_server.openapi_server.models.compu_code_compu_method import CompuCodeCompuMethod  # noqa: E501
from diag_server.openapi_server.models.compu_const import CompuConst  # noqa: E501
from diag_server.openapi_server.models.compu_default_value import CompuDefaultValue  # noqa: E501
from diag_server.openapi_server.models.compu_internal_to_phys import CompuInternalToPhys  # noqa: E501
from diag_server.openapi_server.models.compu_method import CompuMethod  # noqa: E501
from diag_server.openapi_server.models.compu_phys_to_internal import CompuPhysToInternal  # noqa: E501
from diag_server.openapi_server.models.compu_rational_coeffs import CompuRationalCoeffs  # noqa: E501
from diag_server.openapi_server.models.compu_rational_coeffs_numerators_inner import CompuRationalCoeffsNumeratorsInner  # noqa: E501
from diag_server.openapi_server.models.compu_scale import CompuScale  # noqa: E501
from diag_server.openapi_server.models.config_data import ConfigData  # noqa: E501
from diag_server.openapi_server.models.config_data_dictionary_spec import ConfigDataDictionarySpec  # noqa: E501
from diag_server.openapi_server.models.config_id_item import ConfigIdItem  # noqa: E501
from diag_server.openapi_server.models.config_id_item_resolved import ConfigIdItemResolved  # noqa: E501
from diag_server.openapi_server.models.config_item import ConfigItem  # noqa: E501
from diag_server.openapi_server.models.config_item_resolved import ConfigItemResolved  # noqa: E501
from diag_server.openapi_server.models.config_record import ConfigRecord  # noqa: E501
from diag_server.openapi_server.models.data_id_item import DataIdItem  # noqa: E501
from diag_server.openapi_server.models.data_id_item_resolved import DataIdItemResolved  # noqa: E501
from diag_server.openapi_server.models.data_object_property import DataObjectProperty  # noqa: E501
from diag_server.openapi_server.models.data_object_property_resolved import DataObjectPropertyResolved  # noqa: E501
from diag_server.openapi_server.models.data_record import DataRecord  # noqa: E501
from diag_server.openapi_server.models.data_type import DataType  # noqa: E501
from diag_server.openapi_server.models.datablock import Datablock  # noqa: E501
from diag_server.openapi_server.models.datablock_resolved import DatablockResolved  # noqa: E501
from diag_server.openapi_server.models.datafile import Datafile  # noqa: E501
from diag_server.openapi_server.models.dataformat import Dataformat  # noqa: E501
from diag_server.openapi_server.models.dataformat_selection import DataformatSelection  # noqa: E501
from diag_server.openapi_server.models.description import Description  # noqa: E501
from diag_server.openapi_server.models.determine_number_of_items import DetermineNumberOfItems  # noqa: E501
from diag_server.openapi_server.models.determine_number_of_items_resolved import DetermineNumberOfItemsResolved  # noqa: E501
from diag_server.openapi_server.models.diag_class_type import DiagClassType  # noqa: E501
from diag_server.openapi_server.models.diag_coded_type import DiagCodedType  # noqa: E501
from diag_server.openapi_server.models.diag_comm import DiagComm  # noqa: E501
from diag_server.openapi_server.models.diag_comm_data_connector import DiagCommDataConnector  # noqa: E501
from diag_server.openapi_server.models.diag_comm_resolved import DiagCommResolved  # noqa: E501
from diag_server.openapi_server.models.diag_data_dictionary_spec import DiagDataDictionarySpec  # noqa: E501
from diag_server.openapi_server.models.diag_layer import DiagLayer  # noqa: E501
from diag_server.openapi_server.models.diag_layer_container import DiagLayerContainer  # noqa: E501
from diag_server.openapi_server.models.diag_layer_raw import DiagLayerRaw  # noqa: E501
from diag_server.openapi_server.models.diag_layer_raw_diag_comms_raw_inner import DiagLayerRawDiagCommsRawInner  # noqa: E501
from diag_server.openapi_server.models.diag_layer_type import DiagLayerType  # noqa: E501
from diag_server.openapi_server.models.diag_object_connector import DiagObjectConnector  # noqa: E501
from diag_server.openapi_server.models.diag_service import DiagService  # noqa: E501
from diag_server.openapi_server.models.diag_service_resolved import DiagServiceResolved  # noqa: E501
from diag_server.openapi_server.models.diag_variable import DiagVariable  # noqa: E501
from diag_server.openapi_server.models.diag_variable_resolved import DiagVariableResolved  # noqa: E501
from diag_server.openapi_server.models.diagnostic_trouble_code import DiagnosticTroubleCode  # noqa: E501
from diag_server.openapi_server.models.direction import Direction  # noqa: E501
from diag_server.openapi_server.models.doc_revision import DocRevision  # noqa: E501
from diag_server.openapi_server.models.doc_revision_resolved import DocRevisionResolved  # noqa: E501
from diag_server.openapi_server.models.doc_type import DocType  # noqa: E501
from diag_server.openapi_server.models.dop_base import DopBase  # noqa: E501
from diag_server.openapi_server.models.dtc_connector import DtcConnector  # noqa: E501
from diag_server.openapi_server.models.dtc_connector_resolved import DtcConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.dtc_dop import DtcDop  # noqa: E501
from diag_server.openapi_server.models.dtc_dop_dtcs_raw_inner import DtcDopDtcsRawInner  # noqa: E501
from diag_server.openapi_server.models.dyn_defined_spec import DynDefinedSpec  # noqa: E501
from diag_server.openapi_server.models.dyn_end_dop_ref import DynEndDopRef  # noqa: E501
from diag_server.openapi_server.models.dyn_id_def_mode_info import DynIdDefModeInfo  # noqa: E501
from diag_server.openapi_server.models.dyn_id_def_mode_info_resolved import DynIdDefModeInfoResolved  # noqa: E501
from diag_server.openapi_server.models.dyn_id_def_mode_info_selection_table_refs_inner import DynIdDefModeInfoSelectionTableRefsInner  # noqa: E501
from diag_server.openapi_server.models.dynamic_endmarker_field import DynamicEndmarkerField  # noqa: E501
from diag_server.openapi_server.models.dynamic_endmarker_field_resolved import DynamicEndmarkerFieldResolved  # noqa: E501
from diag_server.openapi_server.models.dynamic_length_field import DynamicLengthField  # noqa: E501
from diag_server.openapi_server.models.dynamic_length_field_resolved import DynamicLengthFieldResolved  # noqa: E501
from diag_server.openapi_server.models.dynamic_parameter import DynamicParameter  # noqa: E501
from diag_server.openapi_server.models.ecu_config import EcuConfig  # noqa: E501
from diag_server.openapi_server.models.ecu_group import EcuGroup  # noqa: E501
from diag_server.openapi_server.models.ecu_mem import EcuMem  # noqa: E501
from diag_server.openapi_server.models.ecu_mem_connector import EcuMemConnector  # noqa: E501
from diag_server.openapi_server.models.ecu_mem_connector_resolved import EcuMemConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.ecu_mem_connector_resolved_layers_inner import EcuMemConnectorResolvedLayersInner  # noqa: E501
from diag_server.openapi_server.models.ecu_proxy import EcuProxy  # noqa: E501
from diag_server.openapi_server.models.ecu_shared_data import EcuSharedData  # noqa: E501
from diag_server.openapi_server.models.ecu_shared_data_raw import EcuSharedDataRaw  # noqa: E501
from diag_server.openapi_server.models.ecu_variant import EcuVariant  # noqa: E501
from diag_server.openapi_server.models.ecu_variant_pattern import EcuVariantPattern  # noqa: E501
from diag_server.openapi_server.models.ecu_variant_raw import EcuVariantRaw  # noqa: E501
from diag_server.openapi_server.models.encoding import Encoding  # noqa: E501
from diag_server.openapi_server.models.encrypt_compress_method import EncryptCompressMethod  # noqa: E501
from diag_server.openapi_server.models.encrypt_compress_method_type import EncryptCompressMethodType  # noqa: E501
from diag_server.openapi_server.models.end_of_pdu_field import EndOfPduField  # noqa: E501
from diag_server.openapi_server.models.end_of_pdu_field_resolved import EndOfPduFieldResolved  # noqa: E501
from diag_server.openapi_server.models.env_data_connector import EnvDataConnector  # noqa: E501
from diag_server.openapi_server.models.env_data_connector_resolved import EnvDataConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.environment_data import EnvironmentData  # noqa: E501
from diag_server.openapi_server.models.environment_data_description import EnvironmentDataDescription  # noqa: E501
from diag_server.openapi_server.models.expected_ident import ExpectedIdent  # noqa: E501
from diag_server.openapi_server.models.extern_flashdata import ExternFlashdata  # noqa: E501
from diag_server.openapi_server.models.external_access_method import ExternalAccessMethod  # noqa: E501
from diag_server.openapi_server.models.external_doc import ExternalDoc  # noqa: E501
from diag_server.openapi_server.models.field import Field  # noqa: E501
from diag_server.openapi_server.models.field_resolved import FieldResolved  # noqa: E501
from diag_server.openapi_server.models.filter import Filter  # noqa: E501
from diag_server.openapi_server.models.flash import Flash  # noqa: E501
from diag_server.openapi_server.models.flash_class import FlashClass  # noqa: E501
from diag_server.openapi_server.models.flashdata import Flashdata  # noqa: E501
from diag_server.openapi_server.models.function_diag_comm_connector import FunctionDiagCommConnector  # noqa: E501
from diag_server.openapi_server.models.function_diag_comm_connector_resolved import FunctionDiagCommConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.function_dictionary import FunctionDictionary  # noqa: E501
from diag_server.openapi_server.models.function_in_param import FunctionInParam  # noqa: E501
from diag_server.openapi_server.models.function_in_param_resolved import FunctionInParamResolved  # noqa: E501
from diag_server.openapi_server.models.function_node import FunctionNode  # noqa: E501
from diag_server.openapi_server.models.function_node_group import FunctionNodeGroup  # noqa: E501
from diag_server.openapi_server.models.function_node_group_resolved import FunctionNodeGroupResolved  # noqa: E501
from diag_server.openapi_server.models.function_node_resolved import FunctionNodeResolved  # noqa: E501
from diag_server.openapi_server.models.function_out_param import FunctionOutParam  # noqa: E501
from diag_server.openapi_server.models.function_out_param_resolved import FunctionOutParamResolved  # noqa: E501
from diag_server.openapi_server.models.functional_class import FunctionalClass  # noqa: E501
from diag_server.openapi_server.models.functional_group import FunctionalGroup  # noqa: E501
from diag_server.openapi_server.models.functional_group_raw import FunctionalGroupRaw  # noqa: E501
from diag_server.openapi_server.models.gateway_logical_link import GatewayLogicalLink  # noqa: E501
from diag_server.openapi_server.models.gateway_logical_link_resolved import GatewayLogicalLinkResolved  # noqa: E501
from diag_server.openapi_server.models.group_member import GroupMember  # noqa: E501
from diag_server.openapi_server.models.group_member_resolved import GroupMemberResolved  # noqa: E501
from diag_server.openapi_server.models.hierarchy_element import HierarchyElement  # noqa: E501
from diag_server.openapi_server.models.hierarchy_element_raw import HierarchyElementRaw  # noqa: E501
from diag_server.openapi_server.models.ident_desc import IdentDesc  # noqa: E501
from diag_server.openapi_server.models.ident_value import IdentValue  # noqa: E501
from diag_server.openapi_server.models.ident_value_type import IdentValueType  # noqa: E501
from diag_server.openapi_server.models.identical_compu_method import IdenticalCompuMethod  # noqa: E501
from diag_server.openapi_server.models.identifiable_element import IdentifiableElement  # noqa: E501
from diag_server.openapi_server.models.info_component import InfoComponent  # noqa: E501
from diag_server.openapi_server.models.info_component_type import InfoComponentType  # noqa: E501
from diag_server.openapi_server.models.input_param import InputParam  # noqa: E501
from diag_server.openapi_server.models.intern_flashdata import InternFlashdata  # noqa: E501
from diag_server.openapi_server.models.internal_constr import InternalConstr  # noqa: E501
from diag_server.openapi_server.models.interval_type import IntervalType  # noqa: E501
from diag_server.openapi_server.models.iso_tp import IsoTp  # noqa: E501
from diag_server.openapi_server.models.item_value import ItemValue  # noqa: E501
from diag_server.openapi_server.models.leading_length_info_type import LeadingLengthInfoType  # noqa: E501
from diag_server.openapi_server.models.length_key_parameter import LengthKeyParameter  # noqa: E501
from diag_server.openapi_server.models.length_key_parameter_resolved import LengthKeyParameterResolved  # noqa: E501
from diag_server.openapi_server.models.library import Library  # noqa: E501
from diag_server.openapi_server.models.limit import Limit  # noqa: E501
from diag_server.openapi_server.models.limit_value import LimitValue  # noqa: E501
from diag_server.openapi_server.models.linear_compu_method import LinearCompuMethod  # noqa: E501
from diag_server.openapi_server.models.linear_segment import LinearSegment  # noqa: E501
from diag_server.openapi_server.models.link_comparam_ref import LinkComparamRef  # noqa: E501
from diag_server.openapi_server.models.linked_dtc_dop import LinkedDtcDop  # noqa: E501
from diag_server.openapi_server.models.linked_dtc_dop_resolved import LinkedDtcDopResolved  # noqa: E501
from diag_server.openapi_server.models.logical_link import LogicalLink  # noqa: E501
from diag_server.openapi_server.models.logical_link_resolved import LogicalLinkResolved  # noqa: E501
from diag_server.openapi_server.models.logical_link_type import LogicalLinkType  # noqa: E501
from diag_server.openapi_server.models.matching_base_variant_parameter import MatchingBaseVariantParameter  # noqa: E501
from diag_server.openapi_server.models.matching_component import MatchingComponent  # noqa: E501
from diag_server.openapi_server.models.matching_component_resolved import MatchingComponentResolved  # noqa: E501
from diag_server.openapi_server.models.matching_parameter import MatchingParameter  # noqa: E501
from diag_server.openapi_server.models.matching_request_parameter import MatchingRequestParameter  # noqa: E501
from diag_server.openapi_server.models.mem import Mem  # noqa: E501
from diag_server.openapi_server.models.member_logical_link import MemberLogicalLink  # noqa: E501
from diag_server.openapi_server.models.member_logical_link_resolved import MemberLogicalLinkResolved  # noqa: E501
from diag_server.openapi_server.models.min_max_length_type import MinMaxLengthType  # noqa: E501
from diag_server.openapi_server.models.model_year import ModelYear  # noqa: E501
from diag_server.openapi_server.models.modification import Modification  # noqa: E501
from diag_server.openapi_server.models.multiple_ecu_job import MultipleEcuJob  # noqa: E501
from diag_server.openapi_server.models.multiple_ecu_job_resolved import MultipleEcuJobResolved  # noqa: E501
from diag_server.openapi_server.models.multiple_ecu_job_spec import MultipleEcuJobSpec  # noqa: E501
from diag_server.openapi_server.models.multiplexer import Multiplexer  # noqa: E501
from diag_server.openapi_server.models.multiplexer_case import MultiplexerCase  # noqa: E501
from diag_server.openapi_server.models.multiplexer_case_resolved import MultiplexerCaseResolved  # noqa: E501
from diag_server.openapi_server.models.multiplexer_default_case import MultiplexerDefaultCase  # noqa: E501
from diag_server.openapi_server.models.multiplexer_default_case_resolved import MultiplexerDefaultCaseResolved  # noqa: E501
from diag_server.openapi_server.models.multiplexer_switch_key import MultiplexerSwitchKey  # noqa: E501
from diag_server.openapi_server.models.multiplexer_switch_key_resolved import MultiplexerSwitchKeyResolved  # noqa: E501
from diag_server.openapi_server.models.named_element import NamedElement  # noqa: E501
from diag_server.openapi_server.models.neg_offset import NegOffset  # noqa: E501
from diag_server.openapi_server.models.neg_output_param import NegOutputParam  # noqa: E501
from diag_server.openapi_server.models.negative_response_codes import NegativeResponseCodes  # noqa: E501
from diag_server.openapi_server.models.nrc_const_parameter import NrcConstParameter  # noqa: E501
from diag_server.openapi_server.models.odx_category import OdxCategory  # noqa: E501
from diag_server.openapi_server.models.odx_doc_context import OdxDocContext  # noqa: E501
from diag_server.openapi_server.models.odx_doc_fragment import OdxDocFragment  # noqa: E501
from diag_server.openapi_server.models.odx_link_id import OdxLinkId  # noqa: E501
from diag_server.openapi_server.models.odx_link_ref import OdxLinkRef  # noqa: E501
from diag_server.openapi_server.models.oem import Oem  # noqa: E501
from diag_server.openapi_server.models.option_item import OptionItem  # noqa: E501
from diag_server.openapi_server.models.option_item_resolved import OptionItemResolved  # noqa: E501
from diag_server.openapi_server.models.output_param import OutputParam  # noqa: E501
from diag_server.openapi_server.models.own_ident import OwnIdent  # noqa: E501
from diag_server.openapi_server.models.param_length_info_type import ParamLengthInfoType  # noqa: E501
from diag_server.openapi_server.models.param_length_info_type_resolved import ParamLengthInfoTypeResolved  # noqa: E501
from diag_server.openapi_server.models.parameter import Parameter  # noqa: E501
from diag_server.openapi_server.models.parameter_with_dop import ParameterWithDOP  # noqa: E501
from diag_server.openapi_server.models.parameter_with_dop_resolved import ParameterWithDOPResolved  # noqa: E501
from diag_server.openapi_server.models.parent_ref import ParentRef  # noqa: E501
from diag_server.openapi_server.models.parent_ref_resolved import ParentRefResolved  # noqa: E501
from diag_server.openapi_server.models.phys_mem import PhysMem  # noqa: E501
from diag_server.openapi_server.models.phys_segment import PhysSegment  # noqa: E501
from diag_server.openapi_server.models.physical_constant_parameter import PhysicalConstantParameter  # noqa: E501
from diag_server.openapi_server.models.physical_constant_parameter_resolved import PhysicalConstantParameterResolved  # noqa: E501
from diag_server.openapi_server.models.physical_dimension import PhysicalDimension  # noqa: E501
from diag_server.openapi_server.models.physical_type import PhysicalType  # noqa: E501
from diag_server.openapi_server.models.physical_vehicle_link import PhysicalVehicleLink  # noqa: E501
from diag_server.openapi_server.models.physical_vehicle_link_resolved import PhysicalVehicleLinkResolved  # noqa: E501
from diag_server.openapi_server.models.pin_type import PinType  # noqa: E501
from diag_server.openapi_server.models.pos_offset import PosOffset  # noqa: E501
from diag_server.openapi_server.models.pos_response_suppressible import PosResponseSuppressible  # noqa: E501
from diag_server.openapi_server.models.pre_condition_state_ref import PreConditionStateRef  # noqa: E501
from diag_server.openapi_server.models.prog_code import ProgCode  # noqa: E501
from diag_server.openapi_server.models.prog_code_resolved import ProgCodeResolved  # noqa: E501
from diag_server.openapi_server.models.prot_stack import ProtStack  # noqa: E501
from diag_server.openapi_server.models.prot_stack_resolved import ProtStackResolved  # noqa: E501
from diag_server.openapi_server.models.protocol import Protocol  # noqa: E501
from diag_server.openapi_server.models.protocol_raw import ProtocolRaw  # noqa: E501
from diag_server.openapi_server.models.protocol_raw_resolved import ProtocolRawResolved  # noqa: E501
from diag_server.openapi_server.models.radix import Radix  # noqa: E501
from diag_server.openapi_server.models.rat_func_compu_method import RatFuncCompuMethod  # noqa: E501
from diag_server.openapi_server.models.rat_func_segment import RatFuncSegment  # noqa: E501
from diag_server.openapi_server.models.read_diag_comm_connector import ReadDiagCommConnector  # noqa: E501
from diag_server.openapi_server.models.read_diag_comm_connector_resolved import ReadDiagCommConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.read_param_value import ReadParamValue  # noqa: E501
from diag_server.openapi_server.models.related_diag_comm_ref import RelatedDiagCommRef  # noqa: E501
from diag_server.openapi_server.models.related_doc import RelatedDoc  # noqa: E501
from diag_server.openapi_server.models.request import Request  # noqa: E501
from diag_server.openapi_server.models.reserved_parameter import ReservedParameter  # noqa: E501
from diag_server.openapi_server.models.response import Response  # noqa: E501
from diag_server.openapi_server.models.response_type import ResponseType  # noqa: E501
from diag_server.openapi_server.models.row_fragment import RowFragment  # noqa: E501
from diag_server.openapi_server.models.scale_constr import ScaleConstr  # noqa: E501
from diag_server.openapi_server.models.scale_linear_compu_method import ScaleLinearCompuMethod  # noqa: E501
from diag_server.openapi_server.models.scale_rat_func_compu_method import ScaleRatFuncCompuMethod  # noqa: E501
from diag_server.openapi_server.models.security import Security  # noqa: E501
from diag_server.openapi_server.models.segment import Segment  # noqa: E501
from diag_server.openapi_server.models.session import Session  # noqa: E501
from diag_server.openapi_server.models.session_desc import SessionDesc  # noqa: E501
from diag_server.openapi_server.models.session_desc_resolved import SessionDescResolved  # noqa: E501
from diag_server.openapi_server.models.session_resolved import SessionResolved  # noqa: E501
from diag_server.openapi_server.models.session_sub_elem_type import SessionSubElemType  # noqa: E501
from diag_server.openapi_server.models.sid import SID  # noqa: E501
from diag_server.openapi_server.models.single_ecu_job import SingleEcuJob  # noqa: E501
from diag_server.openapi_server.models.single_ecu_job_resolved import SingleEcuJobResolved  # noqa: E501
from diag_server.openapi_server.models.sizedef_filter import SizedefFilter  # noqa: E501
from diag_server.openapi_server.models.sizedef_phys_segment import SizedefPhysSegment  # noqa: E501
from diag_server.openapi_server.models.special_data import SpecialData  # noqa: E501
from diag_server.openapi_server.models.special_data_group import SpecialDataGroup  # noqa: E501
from diag_server.openapi_server.models.special_data_group_caption import SpecialDataGroupCaption  # noqa: E501
from diag_server.openapi_server.models.special_data_group_values_inner import SpecialDataGroupValuesInner  # noqa: E501
from diag_server.openapi_server.models.standard_length_type import StandardLengthType  # noqa: E501
from diag_server.openapi_server.models.standardization_level import StandardizationLevel  # noqa: E501
from diag_server.openapi_server.models.state import State  # noqa: E501
from diag_server.openapi_server.models.state_chart import StateChart  # noqa: E501
from diag_server.openapi_server.models.state_chart_resolved import StateChartResolved  # noqa: E501
from diag_server.openapi_server.models.state_machine import StateMachine  # noqa: E501
from diag_server.openapi_server.models.state_transition import StateTransition  # noqa: E501
from diag_server.openapi_server.models.state_transition_ref import StateTransitionRef  # noqa: E501
from diag_server.openapi_server.models.static_field import StaticField  # noqa: E501
from diag_server.openapi_server.models.static_field_resolved import StaticFieldResolved  # noqa: E501
from diag_server.openapi_server.models.structure import Structure  # noqa: E501
from diag_server.openapi_server.models.sub_component import SubComponent  # noqa: E501
from diag_server.openapi_server.models.sub_component_param_connector import SubComponentParamConnector  # noqa: E501
from diag_server.openapi_server.models.sub_component_param_connector_resolved import SubComponentParamConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.sub_component_pattern import SubComponentPattern  # noqa: E501
from diag_server.openapi_server.models.sw_variable import SwVariable  # noqa: E501
from diag_server.openapi_server.models.system_item import SystemItem  # noqa: E501
from diag_server.openapi_server.models.system_item_resolved import SystemItemResolved  # noqa: E501
from diag_server.openapi_server.models.system_parameter import SystemParameter  # noqa: E501
from diag_server.openapi_server.models.system_parameter_resolved import SystemParameterResolved  # noqa: E501
from diag_server.openapi_server.models.tab_intp_compu_method import TabIntpCompuMethod  # noqa: E501
from diag_server.openapi_server.models.table import Table  # noqa: E501
from diag_server.openapi_server.models.table_diag_comm_connector import TableDiagCommConnector  # noqa: E501
from diag_server.openapi_server.models.table_diag_comm_connector_resolved import TableDiagCommConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.table_entry_parameter import TableEntryParameter  # noqa: E501
from diag_server.openapi_server.models.table_entry_parameter_resolved import TableEntryParameterResolved  # noqa: E501
from diag_server.openapi_server.models.table_key_parameter import TableKeyParameter  # noqa: E501
from diag_server.openapi_server.models.table_key_parameter_resolved import TableKeyParameterResolved  # noqa: E501
from diag_server.openapi_server.models.table_resolved import TableResolved  # noqa: E501
from diag_server.openapi_server.models.table_row import TableRow  # noqa: E501
from diag_server.openapi_server.models.table_row_connector import TableRowConnector  # noqa: E501
from diag_server.openapi_server.models.table_row_connector_resolved import TableRowConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.table_row_resolved import TableRowResolved  # noqa: E501
from diag_server.openapi_server.models.table_struct_parameter import TableStructParameter  # noqa: E501
from diag_server.openapi_server.models.table_struct_parameter_resolved import TableStructParameterResolved  # noqa: E501
from diag_server.openapi_server.models.table_table_rows_raw_inner import TableTableRowsRawInner  # noqa: E501
from diag_server.openapi_server.models.target_addr_offset import TargetAddrOffset  # noqa: E501
from diag_server.openapi_server.models.team_member import TeamMember  # noqa: E501
from diag_server.openapi_server.models.termination import Termination  # noqa: E501
from diag_server.openapi_server.models.text import Text  # noqa: E501
from diag_server.openapi_server.models.texttable_compu_method import TexttableCompuMethod  # noqa: E501
from diag_server.openapi_server.models.trans_mode import TransMode  # noqa: E501
from diag_server.openapi_server.models.udssid import UDSSID  # noqa: E501
from diag_server.openapi_server.models.unit import Unit  # noqa: E501
from diag_server.openapi_server.models.unit_group import UnitGroup  # noqa: E501
from diag_server.openapi_server.models.unit_group_category import UnitGroupCategory  # noqa: E501
from diag_server.openapi_server.models.unit_group_resolved import UnitGroupResolved  # noqa: E501
from diag_server.openapi_server.models.unit_resolved import UnitResolved  # noqa: E501
from diag_server.openapi_server.models.unit_spec import UnitSpec  # noqa: E501
from diag_server.openapi_server.models.usage import Usage  # noqa: E501
from diag_server.openapi_server.models.valid_base_variant import ValidBaseVariant  # noqa: E501
from diag_server.openapi_server.models.valid_base_variant_resolved import ValidBaseVariantResolved  # noqa: E501
from diag_server.openapi_server.models.valid_type import ValidType  # noqa: E501
from diag_server.openapi_server.models.validity_for import ValidityFor  # noqa: E501
from diag_server.openapi_server.models.value_parameter import ValueParameter  # noqa: E501
from diag_server.openapi_server.models.value_parameter_resolved import ValueParameterResolved  # noqa: E501
from diag_server.openapi_server.models.variable_group import VariableGroup  # noqa: E501
from diag_server.openapi_server.models.variant_pattern1 import VariantPattern1  # noqa: E501
from diag_server.openapi_server.models.vehicle_connector import VehicleConnector  # noqa: E501
from diag_server.openapi_server.models.vehicle_connector_pin import VehicleConnectorPin  # noqa: E501
from diag_server.openapi_server.models.vehicle_info_spec import VehicleInfoSpec  # noqa: E501
from diag_server.openapi_server.models.vehicle_information import VehicleInformation  # noqa: E501
from diag_server.openapi_server.models.vehicle_information_resolved import VehicleInformationResolved  # noqa: E501
from diag_server.openapi_server.models.vehicle_model import VehicleModel  # noqa: E501
from diag_server.openapi_server.models.vehicle_type import VehicleType  # noqa: E501
from diag_server.openapi_server.models.write_diag_comm_connector import WriteDiagCommConnector  # noqa: E501
from diag_server.openapi_server.models.write_diag_comm_connector_resolved import WriteDiagCommConnectorResolved  # noqa: E501
from diag_server.openapi_server.models.x_doc import XDoc  # noqa: E501

class OdxAny(Model):
    """NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).

    Do not edit the class manually.
    """

    def __init__(self, short_name=None, long_name=None, description=None, odx_id=None, oid=None, perma_id=None, ephemeral_id=None, class_name=None, filter_start=None, filter_end=None, fillbyte=None, block_size=None, start_address=None, end_address=None, language=None, company_doc_infos=None, doc_revisions=None, enabled_audience_refs=None, disabled_audience_refs=None, is_supplier_raw=None, is_supplier=None, is_development_raw=None, is_development=None, is_manufacturing_raw=None, is_manufacturing=None, is_aftersales_raw=None, is_aftersales=None, is_aftermarket_raw=None, is_aftermarket=None, enabled_audiences=None, disabled_audiences=None, param_class=None, cptype=None, display_level=None, cpusage=None, audience=None, function_in_params=None, function_out_params=None, component_connectors=None, multiple_ecu_job_refs=None, admin_data=None, sdg=None, multiple_ecu_jobs=None, diag_layer_raw=None, matching_base_variant_parameters=None, variant_type=None, company_datas=None, functional_classes=None, diag_data_dictionary_spec=None, diag_comms_raw=None, diag_comms=None, requests=None, positive_responses=None, negative_responses=None, global_negative_responses=None, import_refs=None, state_charts=None, additional_audiences=None, sub_components=None, libraries=None, sdgs=None, comparam_refs=None, diag_variables_raw=None, diag_variables=None, variable_groups=None, dyn_defined_spec=None, base_variant_pattern=None, parent_refs=None, byte_size=None, parameters=None, source_start_address=None, compressed_size=None, checksum_alg=None, source_end_address=None, uncompressed_size=None, checksum_result=None, semantic=None, byte_position=None, bit_position=None, coded_value_raw=None, coded_value=None, diag_coded_type=None, relation_type=None, diag_comm_ref=None, diag_comm_snref=None, in_param_if_snref=None, out_param_if_snref=None, value_type_raw=None, value_type=None, diag_comm=None, in_param_if=None, out_param_if=None, roles=None, team_members=None, company_specific_info=None, company_data_ref=None, team_member_ref=None, doc_label=None, company_data=None, team_member=None, revision_label=None, state=None, related_docs=None, physical_default_value_raw=None, physical_default_value=None, dop_ref=None, value=None, protocol_snref=None, prot_stack_snref=None, spec_ref=None, spec=None, dop=None, prot_stacks=None, comparams=None, complex_comparams=None, data_object_props=None, unit_spec=None, category=None, subparams=None, allow_multiple_values_raw=None, allow_multiple_values=None, ecu_variant_refs=None, base_variant_ref=None, diag_object_connector=None, diag_object_connector_ref=None, ecu_variants=None, base_variant=None, compu_internal_to_phys=None, compu_phys_to_internal=None, physical_type=None, internal_type=None, v=None, vt=None, data_type=None, compu_inverse_value=None, compu_scales=None, prog_code=None, compu_default_value=None, numerators=None, denominators=None, short_label=None, lower_limit=None, upper_limit=None, compu_const=None, compu_rational_coeffs=None, domain_type=None, range_type=None, valid_base_variants=None, config_records=None, data_object_prop_ref=None, data_object_prop_snref=None, data_object_prop=None, config_id_item=None, diag_comm_data_connectors=None, config_id=None, data_records=None, system_items=None, data_id_item=None, option_items=None, default_data_record_snref=None, compu_method=None, internal_constr=None, unit_ref=None, physical_constr=None, unit=None, rule=None, key=None, data_id=None, datafile=None, data=None, dataformat=None, logical_block_index=None, flashdata_ref=None, filters=None, segments=None, target_addr_offset=None, own_idents=None, securities=None, flashdata=None, latebound_datafile=None, selection=None, user_selection=None, text=None, external_docs=None, text_identifier=None, base_type_encoding=None, base_data_type=None, is_highlow_byte_order_raw=None, is_highlow_byte_order=None, functional_class_refs=None, protocol_snrefs=None, related_diag_comm_refs=None, pre_condition_state_refs=None, state_transition_refs=None, diagnostic_class=None, is_mandatory_raw=None, is_mandatory=None, is_executable_raw=None, is_executable=None, is_final_raw=None, is_final=None, read_diag_comm_connector=None, write_diag_comm_connector=None, protocols=None, pre_condition_states=None, state_transitions=None, dtc_dops=None, env_data_descs=None, structures=None, static_fields=None, dynamic_length_fields=None, dynamic_endmarker_fields=None, end_of_pdu_fields=None, muxs=None, env_datas=None, tables=None, functional_groups=None, ecu_shared_datas=None, base_variants=None, function_diag_comm_connectors=None, table_row_connectors=None, env_data_connectors=None, dtc_connectors=None, request_ref=None, pos_response_refs=None, neg_response_refs=None, pos_response_suppressible=None, is_cyclic_raw=None, is_cyclic=None, is_multiple_raw=None, is_multiple=None, addressing_raw=None, addressing=None, transmission_mode_raw=None, transmission_mode=None, request=None, variable_group_ref=None, sw_variables=None, comm_relations=None, table_snref=None, table_row_snref=None, is_read_before_write_raw=None, is_read_before_write=None, variable_group=None, table=None, table_row=None, trouble_code=None, display_trouble_code=None, level=None, is_temporary_raw=None, is_temporary=None, _date=None, tool=None, company_revision_infos=None, modifications=None, dtc_dop_ref=None, dtc_snref=None, dtc_dop=None, dtc=None, dtcs_raw=None, dtcs=None, linked_dtc_dops_raw=None, linked_dtc_dops=None, is_visible_raw=None, is_visible=None, dyn_id_def_mode_infos=None, ref_id=None, ref_docs=None, termination_value_raw=None, resolved_object_perma_id=None, resolved_object_ephemeral_id=None, resolved_object_short_name=None, def_mode=None, clear_dyn_def_message_ref=None, clear_dyn_def_message_snref=None, read_dyn_def_message_ref=None, read_dyn_def_message_snref=None, dyn_def_message_ref=None, dyn_def_message_snref=None, supported_dyn_ids=None, selection_table_refs=None, clear_dyn_def_message=None, read_dyn_def_message=None, dyn_def_message=None, selection_tables=None, structure_ref=None, structure_snref=None, env_data_desc_ref=None, env_data_desc_snref=None, dyn_end_dop_ref=None, structure=None, dyn_end_dop=None, offset=None, determine_number_of_items=None, config_datas=None, config_data_dictionary_spec=None, group_members=None, mem=None, phys_mem=None, flash_classes=None, session_descs=None, ident_descs=None, ecu_mem_ref=None, layer_refs=None, all_variant_refs=None, ecu_mem=None, layers=None, all_variants=None, component_type=None, matching_components=None, matching_parameters=None, ecu_variant_patterns=None, value_raw=None, max_number_of_items=None, min_number_of_items=None, env_data_snref=None, env_data_desc=None, env_data=None, all_value=None, dtc_values=None, param_snref=None, param_snpathref=None, env_data_refs=None, ident_values=None, size_length=None, address_length=None, encrypt_compress_method=None, method=None, href=None, ecu_mems=None, ecu_mem_connectors=None, logical_link_ref=None, logical_link=None, function_nodes=None, function_node_groups=None, function_diag_comm_connector=None, function_node_refs=None, link_type=None, gateway_logical_link_refs=None, physical_vehicle_link_ref=None, protocol_ref=None, functional_group_ref=None, ecu_proxy_refs=None, link_comparam_refs_raw=None, link_comparam_refs=None, gateway_logical_links=None, physical_vehicle_link=None, protocol=None, functional_group=None, ecu_proxies=None, prot_stack=None, funct_resolution_link_ref=None, phys_resolution_link_ref=None, funct_resolution_link=None, phys_resolution_link=None, ident_if_snref=None, out_param_if_snpathref=None, dop_base_ref=None, scale_constrs=None, phys_constant_value=None, meaning=None, bit_length=None, dop_snref=None, code_file=None, encryption=None, syntax=None, revision=None, entrypoint=None, interval_type=None, factor=None, denominator=None, internal_lower_limit=None, internal_upper_limit=None, inverse_value=None, simple_value=None, complex_value=None, not_inherited_dtc_snrefs=None, not_inherited_dtcs=None, expected_value=None, use_physical_addressing_raw=None, use_physical_addressing=None, multiple_ecu_job_ref=None, multiple_ecu_job=None, request_byte_position=None, byte_length=None, sessions=None, datablocks=None, flashdatas=None, max_length=None, min_length=None, termination=None, change=None, reason=None, prog_codes=None, input_params=None, output_params=None, neg_output_params=None, diag_layer_refs=None, diag_layers=None, switch_key=None, default_case=None, cases=None, negative_offset=None, coded_values_raw=None, coded_values=None, version=None, doc_fragments=None, doc_name=None, doc_type=None, local_id=None, item_values=None, write_audience=None, read_audience=None, ident_value=None, length_key_ref=None, length_key=None, layer_ref=None, not_inherited_diag_comms=None, not_inherited_variables=None, not_inherited_dops=None, not_inherited_tables=None, not_inherited_global_neg_responses=None, layer=None, phys_segments=None, physical_constant_value=None, length_exp=None, mass_exp=None, time_exp=None, current_exp=None, temperature_exp=None, molar_amount_exp=None, luminous_intensity_exp=None, precision=None, display_radix=None, vehicle_connector_pin_refs=None, vehicle_connector_pins=None, positive_offset=None, bit_mask=None, coded_const_snref=None, coded_const_snpathref=None, value_snref=None, value_snpathref=None, phys_const_snref=None, phys_const_snpathref=None, table_key_snref=None, table_key_snpathref=None, in_param_if_snpathref=None, library_refs=None, pdu_protocol_type=None, physical_link_type=None, comparam_subset_refs=None, comparam_subsets=None, comparam_spec_ref=None, comparam_spec=None, numerator_coeffs=None, denominator_coeffs=None, read_param_values=None, read_diag_comm_ref=None, read_diag_comm_snref=None, read_data_snref=None, read_data_snpathref=None, read_diag_comm=None, xdoc=None, response_type=None, validity=None, security_method=None, fw_signature=None, fw_checksum=None, validity_for=None, expected_idents=None, checksums=None, datablock_refs=None, partnumber=None, priority=None, session_snref=None, flash_class_refs=None, own_ident=None, direction=None, filter_size=None, size=None, semantic_info=None, sdg_caption=None, sdg_caption_ref=None, values=None, is_condensed_raw=None, is_condensed=None, start_state_snref=None, states=None, start_state=None, succeeded=None, source_snref=None, target_snref=None, external_access_method=None, fixed_number_of_items=None, item_byte_size=None, sub_component_patterns=None, sub_component_param_connectors=None, out_param_if_refs=None, in_param_if_refs=None, out_param_ifs=None, in_param_ifs=None, origin=None, sysparam=None, key_label=None, struct_label=None, key_dop_ref=None, table_rows_raw=None, table_rows=None, table_diag_comm_connectors=None, target=None, table_row_ref=None, table_ref=None, key_dop=None, key_raw=None, table_key_ref=None, table_key=None, department=None, address=None, zipcode=None, city=None, phone=None, fax=None, email=None, display_name=None, factor_si_to_unit=None, offset_si_to_unit=None, physical_dimension_ref=None, unit_refs=None, units=None, physical_dimension=None, unit_groups=None, physical_dimensions=None, ecu_variant_snrefs=None, base_variant_snref=None, pin_number=None, pin_type=None, info_components=None, vehicle_informations=None, info_component_refs=None, vehicle_connectors=None, logical_links=None, ecu_groups=None, physical_vehicle_links=None, write_diag_comm_ref=None, write_diag_comm_snref=None, write_data_snref=None, write_data_snpathref=None, write_diag_comm=None, write_data=None, number=None, publisher=None, url=None, position=None):  # noqa: E501
        """OdxAny - a model defined in OpenAPI

        :param short_name: The short_name of this OdxAny.  # noqa: E501
        :type short_name: str
        :param long_name: The long_name of this OdxAny.  # noqa: E501
        :type long_name: str
        :param description: The description of this OdxAny.  # noqa: E501
        :type description: Description
        :param odx_id: The odx_id of this OdxAny.  # noqa: E501
        :type odx_id: OdxLinkId
        :param oid: The oid of this OdxAny.  # noqa: E501
        :type oid: str
        :param perma_id: The perma_id of this OdxAny.  # noqa: E501
        :type perma_id: str
        :param ephemeral_id: The ephemeral_id of this OdxAny.  # noqa: E501
        :type ephemeral_id: int
        :param class_name: The class_name of this OdxAny.  # noqa: E501
        :type class_name: str
        :param filter_start: The filter_start of this OdxAny.  # noqa: E501
        :type filter_start: int
        :param filter_end: The filter_end of this OdxAny.  # noqa: E501
        :type filter_end: int
        :param fillbyte: The fillbyte of this OdxAny.  # noqa: E501
        :type fillbyte: int
        :param block_size: The block_size of this OdxAny.  # noqa: E501
        :type block_size: int
        :param start_address: The start_address of this OdxAny.  # noqa: E501
        :type start_address: int
        :param end_address: The end_address of this OdxAny.  # noqa: E501
        :type end_address: int
        :param language: The language of this OdxAny.  # noqa: E501
        :type language: str
        :param company_doc_infos: The company_doc_infos of this OdxAny.  # noqa: E501
        :type company_doc_infos: List[CompanyDocInfo]
        :param doc_revisions: The doc_revisions of this OdxAny.  # noqa: E501
        :type doc_revisions: List[DocRevision]
        :param enabled_audience_refs: The enabled_audience_refs of this OdxAny.  # noqa: E501
        :type enabled_audience_refs: List[OdxLinkRef]
        :param disabled_audience_refs: The disabled_audience_refs of this OdxAny.  # noqa: E501
        :type disabled_audience_refs: List[OdxLinkRef]
        :param is_supplier_raw: The is_supplier_raw of this OdxAny.  # noqa: E501
        :type is_supplier_raw: bool
        :param is_supplier: The is_supplier of this OdxAny.  # noqa: E501
        :type is_supplier: bool
        :param is_development_raw: The is_development_raw of this OdxAny.  # noqa: E501
        :type is_development_raw: bool
        :param is_development: The is_development of this OdxAny.  # noqa: E501
        :type is_development: bool
        :param is_manufacturing_raw: The is_manufacturing_raw of this OdxAny.  # noqa: E501
        :type is_manufacturing_raw: bool
        :param is_manufacturing: The is_manufacturing of this OdxAny.  # noqa: E501
        :type is_manufacturing: bool
        :param is_aftersales_raw: The is_aftersales_raw of this OdxAny.  # noqa: E501
        :type is_aftersales_raw: bool
        :param is_aftersales: The is_aftersales of this OdxAny.  # noqa: E501
        :type is_aftersales: bool
        :param is_aftermarket_raw: The is_aftermarket_raw of this OdxAny.  # noqa: E501
        :type is_aftermarket_raw: bool
        :param is_aftermarket: The is_aftermarket of this OdxAny.  # noqa: E501
        :type is_aftermarket: bool
        :param enabled_audiences: The enabled_audiences of this OdxAny.  # noqa: E501
        :type enabled_audiences: List[AdditionalAudience]
        :param disabled_audiences: The disabled_audiences of this OdxAny.  # noqa: E501
        :type disabled_audiences: List[AdditionalAudience]
        :param param_class: The param_class of this OdxAny.  # noqa: E501
        :type param_class: str
        :param cptype: The cptype of this OdxAny.  # noqa: E501
        :type cptype: StandardizationLevel
        :param display_level: The display_level of this OdxAny.  # noqa: E501
        :type display_level: int
        :param cpusage: The cpusage of this OdxAny.  # noqa: E501
        :type cpusage: Usage
        :param audience: The audience of this OdxAny.  # noqa: E501
        :type audience: Audience
        :param function_in_params: The function_in_params of this OdxAny.  # noqa: E501
        :type function_in_params: List[FunctionInParam]
        :param function_out_params: The function_out_params of this OdxAny.  # noqa: E501
        :type function_out_params: List[FunctionOutParam]
        :param component_connectors: The component_connectors of this OdxAny.  # noqa: E501
        :type component_connectors: List[ComponentConnector]
        :param multiple_ecu_job_refs: The multiple_ecu_job_refs of this OdxAny.  # noqa: E501
        :type multiple_ecu_job_refs: List[OdxLinkRef]
        :param admin_data: The admin_data of this OdxAny.  # noqa: E501
        :type admin_data: AdminData
        :param sdg: The sdg of this OdxAny.  # noqa: E501
        :type sdg: SpecialDataGroup
        :param multiple_ecu_jobs: The multiple_ecu_jobs of this OdxAny.  # noqa: E501
        :type multiple_ecu_jobs: List[MultipleEcuJob]
        :param diag_layer_raw: The diag_layer_raw of this OdxAny.  # noqa: E501
        :type diag_layer_raw: DiagLayerRaw
        :param matching_base_variant_parameters: The matching_base_variant_parameters of this OdxAny.  # noqa: E501
        :type matching_base_variant_parameters: List[MatchingBaseVariantParameter]
        :param variant_type: The variant_type of this OdxAny.  # noqa: E501
        :type variant_type: DiagLayerType
        :param company_datas: The company_datas of this OdxAny.  # noqa: E501
        :type company_datas: List[CompanyData1]
        :param functional_classes: The functional_classes of this OdxAny.  # noqa: E501
        :type functional_classes: List[FunctionalClass]
        :param diag_data_dictionary_spec: The diag_data_dictionary_spec of this OdxAny.  # noqa: E501
        :type diag_data_dictionary_spec: DiagDataDictionarySpec
        :param diag_comms_raw: The diag_comms_raw of this OdxAny.  # noqa: E501
        :type diag_comms_raw: List[DiagLayerRawDiagCommsRawInner]
        :param diag_comms: The diag_comms of this OdxAny.  # noqa: E501
        :type diag_comms: List[DiagComm]
        :param requests: The requests of this OdxAny.  # noqa: E501
        :type requests: List[Request]
        :param positive_responses: The positive_responses of this OdxAny.  # noqa: E501
        :type positive_responses: List[Response]
        :param negative_responses: The negative_responses of this OdxAny.  # noqa: E501
        :type negative_responses: List[Response]
        :param global_negative_responses: The global_negative_responses of this OdxAny.  # noqa: E501
        :type global_negative_responses: List[Response]
        :param import_refs: The import_refs of this OdxAny.  # noqa: E501
        :type import_refs: List[OdxLinkRef]
        :param state_charts: The state_charts of this OdxAny.  # noqa: E501
        :type state_charts: List[StateChart]
        :param additional_audiences: The additional_audiences of this OdxAny.  # noqa: E501
        :type additional_audiences: List[AdditionalAudience]
        :param sub_components: The sub_components of this OdxAny.  # noqa: E501
        :type sub_components: List[SubComponent]
        :param libraries: The libraries of this OdxAny.  # noqa: E501
        :type libraries: List[Library]
        :param sdgs: The sdgs of this OdxAny.  # noqa: E501
        :type sdgs: List[SpecialDataGroup]
        :param comparam_refs: The comparam_refs of this OdxAny.  # noqa: E501
        :type comparam_refs: List[ComparamInstance]
        :param diag_variables_raw: The diag_variables_raw of this OdxAny.  # noqa: E501
        :type diag_variables_raw: List[BaseVariantRawDiagVariablesRawInner]
        :param diag_variables: The diag_variables of this OdxAny.  # noqa: E501
        :type diag_variables: List[DiagVariable]
        :param variable_groups: The variable_groups of this OdxAny.  # noqa: E501
        :type variable_groups: List[VariableGroup]
        :param dyn_defined_spec: The dyn_defined_spec of this OdxAny.  # noqa: E501
        :type dyn_defined_spec: DynDefinedSpec
        :param base_variant_pattern: The base_variant_pattern of this OdxAny.  # noqa: E501
        :type base_variant_pattern: BaseVariantPattern
        :param parent_refs: The parent_refs of this OdxAny.  # noqa: E501
        :type parent_refs: List[ParentRef]
        :param byte_size: The byte_size of this OdxAny.  # noqa: E501
        :type byte_size: int
        :param parameters: The parameters of this OdxAny.  # noqa: E501
        :type parameters: List[Parameter]
        :param source_start_address: The source_start_address of this OdxAny.  # noqa: E501
        :type source_start_address: int
        :param compressed_size: The compressed_size of this OdxAny.  # noqa: E501
        :type compressed_size: int
        :param checksum_alg: The checksum_alg of this OdxAny.  # noqa: E501
        :type checksum_alg: str
        :param source_end_address: The source_end_address of this OdxAny.  # noqa: E501
        :type source_end_address: int
        :param uncompressed_size: The uncompressed_size of this OdxAny.  # noqa: E501
        :type uncompressed_size: int
        :param checksum_result: The checksum_result of this OdxAny.  # noqa: E501
        :type checksum_result: ValidityFor
        :param semantic: The semantic of this OdxAny.  # noqa: E501
        :type semantic: str
        :param byte_position: The byte_position of this OdxAny.  # noqa: E501
        :type byte_position: int
        :param bit_position: The bit_position of this OdxAny.  # noqa: E501
        :type bit_position: int
        :param coded_value_raw: The coded_value_raw of this OdxAny.  # noqa: E501
        :type coded_value_raw: str
        :param coded_value: The coded_value of this OdxAny.  # noqa: E501
        :type coded_value: LimitValue
        :param diag_coded_type: The diag_coded_type of this OdxAny.  # noqa: E501
        :type diag_coded_type: DiagCodedType
        :param relation_type: The relation_type of this OdxAny.  # noqa: E501
        :type relation_type: str
        :param diag_comm_ref: The diag_comm_ref of this OdxAny.  # noqa: E501
        :type diag_comm_ref: OdxLinkRef
        :param diag_comm_snref: The diag_comm_snref of this OdxAny.  # noqa: E501
        :type diag_comm_snref: str
        :param in_param_if_snref: The in_param_if_snref of this OdxAny.  # noqa: E501
        :type in_param_if_snref: str
        :param out_param_if_snref: The out_param_if_snref of this OdxAny.  # noqa: E501
        :type out_param_if_snref: str
        :param value_type_raw: The value_type_raw of this OdxAny.  # noqa: E501
        :type value_type_raw: CommRelationValueType
        :param value_type: The value_type of this OdxAny.  # noqa: E501
        :type value_type: SessionSubElemType
        :param diag_comm: The diag_comm of this OdxAny.  # noqa: E501
        :type diag_comm: DiagCommResolved
        :param in_param_if: The in_param_if of this OdxAny.  # noqa: E501
        :type in_param_if: Parameter
        :param out_param_if: The out_param_if of this OdxAny.  # noqa: E501
        :type out_param_if: Parameter
        :param roles: The roles of this OdxAny.  # noqa: E501
        :type roles: List[str]
        :param team_members: The team_members of this OdxAny.  # noqa: E501
        :type team_members: List[TeamMember]
        :param company_specific_info: The company_specific_info of this OdxAny.  # noqa: E501
        :type company_specific_info: CompanySpecificInfo
        :param company_data_ref: The company_data_ref of this OdxAny.  # noqa: E501
        :type company_data_ref: OdxLinkRef
        :param team_member_ref: The team_member_ref of this OdxAny.  # noqa: E501
        :type team_member_ref: OdxLinkRef
        :param doc_label: The doc_label of this OdxAny.  # noqa: E501
        :type doc_label: str
        :param company_data: The company_data of this OdxAny.  # noqa: E501
        :type company_data: CompanyData1
        :param team_member: The team_member of this OdxAny.  # noqa: E501
        :type team_member: TeamMember
        :param revision_label: The revision_label of this OdxAny.  # noqa: E501
        :type revision_label: str
        :param state: The state of this OdxAny.  # noqa: E501
        :type state: str
        :param related_docs: The related_docs of this OdxAny.  # noqa: E501
        :type related_docs: List[RelatedDoc]
        :param physical_default_value_raw: The physical_default_value_raw of this OdxAny.  # noqa: E501
        :type physical_default_value_raw: str
        :param physical_default_value: The physical_default_value of this OdxAny.  # noqa: E501
        :type physical_default_value: LimitValue
        :param dop_ref: The dop_ref of this OdxAny.  # noqa: E501
        :type dop_ref: OdxLinkRef
        :param value: The value of this OdxAny.  # noqa: E501
        :type value: LimitValue
        :param protocol_snref: The protocol_snref of this OdxAny.  # noqa: E501
        :type protocol_snref: str
        :param prot_stack_snref: The prot_stack_snref of this OdxAny.  # noqa: E501
        :type prot_stack_snref: str
        :param spec_ref: The spec_ref of this OdxAny.  # noqa: E501
        :type spec_ref: OdxLinkRef
        :param spec: The spec of this OdxAny.  # noqa: E501
        :type spec: BaseComparam
        :param dop: The dop of this OdxAny.  # noqa: E501
        :type dop: DopBase
        :param prot_stacks: The prot_stacks of this OdxAny.  # noqa: E501
        :type prot_stacks: List[ProtStack]
        :param comparams: The comparams of this OdxAny.  # noqa: E501
        :type comparams: List[ComparamInstance]
        :param complex_comparams: The complex_comparams of this OdxAny.  # noqa: E501
        :type complex_comparams: List[ComplexComparam]
        :param data_object_props: The data_object_props of this OdxAny.  # noqa: E501
        :type data_object_props: List[DataObjectProperty]
        :param unit_spec: The unit_spec of this OdxAny.  # noqa: E501
        :type unit_spec: UnitSpec
        :param category: The category of this OdxAny.  # noqa: E501
        :type category: UnitGroupCategory
        :param subparams: The subparams of this OdxAny.  # noqa: E501
        :type subparams: List[BaseComparam]
        :param allow_multiple_values_raw: The allow_multiple_values_raw of this OdxAny.  # noqa: E501
        :type allow_multiple_values_raw: bool
        :param allow_multiple_values: The allow_multiple_values of this OdxAny.  # noqa: E501
        :type allow_multiple_values: bool
        :param ecu_variant_refs: The ecu_variant_refs of this OdxAny.  # noqa: E501
        :type ecu_variant_refs: List[OdxLinkRef]
        :param base_variant_ref: The base_variant_ref of this OdxAny.  # noqa: E501
        :type base_variant_ref: OdxLinkRef
        :param diag_object_connector: The diag_object_connector of this OdxAny.  # noqa: E501
        :type diag_object_connector: DiagObjectConnector
        :param diag_object_connector_ref: The diag_object_connector_ref of this OdxAny.  # noqa: E501
        :type diag_object_connector_ref: OdxLinkRef
        :param ecu_variants: The ecu_variants of this OdxAny.  # noqa: E501
        :type ecu_variants: List[EcuVariant]
        :param base_variant: The base_variant of this OdxAny.  # noqa: E501
        :type base_variant: BaseVariant
        :param compu_internal_to_phys: The compu_internal_to_phys of this OdxAny.  # noqa: E501
        :type compu_internal_to_phys: CompuInternalToPhys
        :param compu_phys_to_internal: The compu_phys_to_internal of this OdxAny.  # noqa: E501
        :type compu_phys_to_internal: CompuPhysToInternal
        :param physical_type: The physical_type of this OdxAny.  # noqa: E501
        :type physical_type: DataType
        :param internal_type: The internal_type of this OdxAny.  # noqa: E501
        :type internal_type: DataType
        :param v: The v of this OdxAny.  # noqa: E501
        :type v: str
        :param vt: The vt of this OdxAny.  # noqa: E501
        :type vt: str
        :param data_type: The data_type of this OdxAny.  # noqa: E501
        :type data_type: str
        :param compu_inverse_value: The compu_inverse_value of this OdxAny.  # noqa: E501
        :type compu_inverse_value: CompuConst
        :param compu_scales: The compu_scales of this OdxAny.  # noqa: E501
        :type compu_scales: List[CompuScale]
        :param prog_code: The prog_code of this OdxAny.  # noqa: E501
        :type prog_code: ProgCode
        :param compu_default_value: The compu_default_value of this OdxAny.  # noqa: E501
        :type compu_default_value: CompuDefaultValue
        :param numerators: The numerators of this OdxAny.  # noqa: E501
        :type numerators: List[CompuRationalCoeffsNumeratorsInner]
        :param denominators: The denominators of this OdxAny.  # noqa: E501
        :type denominators: List[CompuRationalCoeffsNumeratorsInner]
        :param short_label: The short_label of this OdxAny.  # noqa: E501
        :type short_label: str
        :param lower_limit: The lower_limit of this OdxAny.  # noqa: E501
        :type lower_limit: Limit
        :param upper_limit: The upper_limit of this OdxAny.  # noqa: E501
        :type upper_limit: Limit
        :param compu_const: The compu_const of this OdxAny.  # noqa: E501
        :type compu_const: CompuConst
        :param compu_rational_coeffs: The compu_rational_coeffs of this OdxAny.  # noqa: E501
        :type compu_rational_coeffs: CompuRationalCoeffs
        :param domain_type: The domain_type of this OdxAny.  # noqa: E501
        :type domain_type: DataType
        :param range_type: The range_type of this OdxAny.  # noqa: E501
        :type range_type: DataType
        :param valid_base_variants: The valid_base_variants of this OdxAny.  # noqa: E501
        :type valid_base_variants: List[ValidBaseVariant]
        :param config_records: The config_records of this OdxAny.  # noqa: E501
        :type config_records: List[ConfigRecord]
        :param data_object_prop_ref: The data_object_prop_ref of this OdxAny.  # noqa: E501
        :type data_object_prop_ref: OdxLinkRef
        :param data_object_prop_snref: The data_object_prop_snref of this OdxAny.  # noqa: E501
        :type data_object_prop_snref: str
        :param data_object_prop: The data_object_prop of this OdxAny.  # noqa: E501
        :type data_object_prop: DopBase
        :param config_id_item: The config_id_item of this OdxAny.  # noqa: E501
        :type config_id_item: ConfigIdItem
        :param diag_comm_data_connectors: The diag_comm_data_connectors of this OdxAny.  # noqa: E501
        :type diag_comm_data_connectors: List[DiagCommDataConnector]
        :param config_id: The config_id of this OdxAny.  # noqa: E501
        :type config_id: IdentValue
        :param data_records: The data_records of this OdxAny.  # noqa: E501
        :type data_records: List[DataRecord]
        :param system_items: The system_items of this OdxAny.  # noqa: E501
        :type system_items: List[SystemItem]
        :param data_id_item: The data_id_item of this OdxAny.  # noqa: E501
        :type data_id_item: DataIdItem
        :param option_items: The option_items of this OdxAny.  # noqa: E501
        :type option_items: List[OptionItem]
        :param default_data_record_snref: The default_data_record_snref of this OdxAny.  # noqa: E501
        :type default_data_record_snref: str
        :param compu_method: The compu_method of this OdxAny.  # noqa: E501
        :type compu_method: CompuMethod
        :param internal_constr: The internal_constr of this OdxAny.  # noqa: E501
        :type internal_constr: InternalConstr
        :param unit_ref: The unit_ref of this OdxAny.  # noqa: E501
        :type unit_ref: OdxLinkRef
        :param physical_constr: The physical_constr of this OdxAny.  # noqa: E501
        :type physical_constr: InternalConstr
        :param unit: The unit of this OdxAny.  # noqa: E501
        :type unit: Unit
        :param rule: The rule of this OdxAny.  # noqa: E501
        :type rule: str
        :param key: The key of this OdxAny.  # noqa: E501
        :type key: LimitValue
        :param data_id: The data_id of this OdxAny.  # noqa: E501
        :type data_id: IdentValue
        :param datafile: The datafile of this OdxAny.  # noqa: E501
        :type datafile: Datafile
        :param data: The data of this OdxAny.  # noqa: E501
        :type data: str
        :param dataformat: The dataformat of this OdxAny.  # noqa: E501
        :type dataformat: Dataformat
        :param logical_block_index: The logical_block_index of this OdxAny.  # noqa: E501
        :type logical_block_index: int
        :param flashdata_ref: The flashdata_ref of this OdxAny.  # noqa: E501
        :type flashdata_ref: OdxLinkRef
        :param filters: The filters of this OdxAny.  # noqa: E501
        :type filters: List[Filter]
        :param segments: The segments of this OdxAny.  # noqa: E501
        :type segments: List[Segment]
        :param target_addr_offset: The target_addr_offset of this OdxAny.  # noqa: E501
        :type target_addr_offset: TargetAddrOffset
        :param own_idents: The own_idents of this OdxAny.  # noqa: E501
        :type own_idents: List[OwnIdent]
        :param securities: The securities of this OdxAny.  # noqa: E501
        :type securities: List[Security]
        :param flashdata: The flashdata of this OdxAny.  # noqa: E501
        :type flashdata: Flashdata
        :param latebound_datafile: The latebound_datafile of this OdxAny.  # noqa: E501
        :type latebound_datafile: bool
        :param selection: The selection of this OdxAny.  # noqa: E501
        :type selection: DataformatSelection
        :param user_selection: The user_selection of this OdxAny.  # noqa: E501
        :type user_selection: str
        :param text: The text of this OdxAny.  # noqa: E501
        :type text: str
        :param external_docs: The external_docs of this OdxAny.  # noqa: E501
        :type external_docs: List[ExternalDoc]
        :param text_identifier: The text_identifier of this OdxAny.  # noqa: E501
        :type text_identifier: str
        :param base_type_encoding: The base_type_encoding of this OdxAny.  # noqa: E501
        :type base_type_encoding: Encoding
        :param base_data_type: The base_data_type of this OdxAny.  # noqa: E501
        :type base_data_type: DataType
        :param is_highlow_byte_order_raw: The is_highlow_byte_order_raw of this OdxAny.  # noqa: E501
        :type is_highlow_byte_order_raw: bool
        :param is_highlow_byte_order: The is_highlow_byte_order of this OdxAny.  # noqa: E501
        :type is_highlow_byte_order: bool
        :param functional_class_refs: The functional_class_refs of this OdxAny.  # noqa: E501
        :type functional_class_refs: List[OdxLinkRef]
        :param protocol_snrefs: The protocol_snrefs of this OdxAny.  # noqa: E501
        :type protocol_snrefs: List[str]
        :param related_diag_comm_refs: The related_diag_comm_refs of this OdxAny.  # noqa: E501
        :type related_diag_comm_refs: List[RelatedDiagCommRef]
        :param pre_condition_state_refs: The pre_condition_state_refs of this OdxAny.  # noqa: E501
        :type pre_condition_state_refs: List[PreConditionStateRef]
        :param state_transition_refs: The state_transition_refs of this OdxAny.  # noqa: E501
        :type state_transition_refs: List[StateTransitionRef]
        :param diagnostic_class: The diagnostic_class of this OdxAny.  # noqa: E501
        :type diagnostic_class: DiagClassType
        :param is_mandatory_raw: The is_mandatory_raw of this OdxAny.  # noqa: E501
        :type is_mandatory_raw: bool
        :param is_mandatory: The is_mandatory of this OdxAny.  # noqa: E501
        :type is_mandatory: bool
        :param is_executable_raw: The is_executable_raw of this OdxAny.  # noqa: E501
        :type is_executable_raw: bool
        :param is_executable: The is_executable of this OdxAny.  # noqa: E501
        :type is_executable: bool
        :param is_final_raw: The is_final_raw of this OdxAny.  # noqa: E501
        :type is_final_raw: bool
        :param is_final: The is_final of this OdxAny.  # noqa: E501
        :type is_final: bool
        :param read_diag_comm_connector: The read_diag_comm_connector of this OdxAny.  # noqa: E501
        :type read_diag_comm_connector: ReadDiagCommConnector
        :param write_diag_comm_connector: The write_diag_comm_connector of this OdxAny.  # noqa: E501
        :type write_diag_comm_connector: WriteDiagCommConnector
        :param protocols: The protocols of this OdxAny.  # noqa: E501
        :type protocols: List[Protocol]
        :param pre_condition_states: The pre_condition_states of this OdxAny.  # noqa: E501
        :type pre_condition_states: List[State]
        :param state_transitions: The state_transitions of this OdxAny.  # noqa: E501
        :type state_transitions: List[StateTransition]
        :param dtc_dops: The dtc_dops of this OdxAny.  # noqa: E501
        :type dtc_dops: List[DtcDop]
        :param env_data_descs: The env_data_descs of this OdxAny.  # noqa: E501
        :type env_data_descs: List[EnvironmentDataDescription]
        :param structures: The structures of this OdxAny.  # noqa: E501
        :type structures: List[Structure]
        :param static_fields: The static_fields of this OdxAny.  # noqa: E501
        :type static_fields: List[StaticField]
        :param dynamic_length_fields: The dynamic_length_fields of this OdxAny.  # noqa: E501
        :type dynamic_length_fields: List[DynamicLengthField]
        :param dynamic_endmarker_fields: The dynamic_endmarker_fields of this OdxAny.  # noqa: E501
        :type dynamic_endmarker_fields: List[DynamicEndmarkerField]
        :param end_of_pdu_fields: The end_of_pdu_fields of this OdxAny.  # noqa: E501
        :type end_of_pdu_fields: List[EndOfPduField]
        :param muxs: The muxs of this OdxAny.  # noqa: E501
        :type muxs: List[Multiplexer]
        :param env_datas: The env_datas of this OdxAny.  # noqa: E501
        :type env_datas: List[EnvironmentData]
        :param tables: The tables of this OdxAny.  # noqa: E501
        :type tables: List[Table]
        :param functional_groups: The functional_groups of this OdxAny.  # noqa: E501
        :type functional_groups: List[FunctionalGroup]
        :param ecu_shared_datas: The ecu_shared_datas of this OdxAny.  # noqa: E501
        :type ecu_shared_datas: List[EcuSharedData]
        :param base_variants: The base_variants of this OdxAny.  # noqa: E501
        :type base_variants: List[BaseVariant]
        :param function_diag_comm_connectors: The function_diag_comm_connectors of this OdxAny.  # noqa: E501
        :type function_diag_comm_connectors: List[FunctionDiagCommConnector]
        :param table_row_connectors: The table_row_connectors of this OdxAny.  # noqa: E501
        :type table_row_connectors: List[TableRowConnector]
        :param env_data_connectors: The env_data_connectors of this OdxAny.  # noqa: E501
        :type env_data_connectors: List[EnvDataConnector]
        :param dtc_connectors: The dtc_connectors of this OdxAny.  # noqa: E501
        :type dtc_connectors: List[DtcConnector]
        :param request_ref: The request_ref of this OdxAny.  # noqa: E501
        :type request_ref: OdxLinkRef
        :param pos_response_refs: The pos_response_refs of this OdxAny.  # noqa: E501
        :type pos_response_refs: List[OdxLinkRef]
        :param neg_response_refs: The neg_response_refs of this OdxAny.  # noqa: E501
        :type neg_response_refs: List[OdxLinkRef]
        :param pos_response_suppressible: The pos_response_suppressible of this OdxAny.  # noqa: E501
        :type pos_response_suppressible: PosResponseSuppressible
        :param is_cyclic_raw: The is_cyclic_raw of this OdxAny.  # noqa: E501
        :type is_cyclic_raw: bool
        :param is_cyclic: The is_cyclic of this OdxAny.  # noqa: E501
        :type is_cyclic: bool
        :param is_multiple_raw: The is_multiple_raw of this OdxAny.  # noqa: E501
        :type is_multiple_raw: bool
        :param is_multiple: The is_multiple of this OdxAny.  # noqa: E501
        :type is_multiple: bool
        :param addressing_raw: The addressing_raw of this OdxAny.  # noqa: E501
        :type addressing_raw: Addressing
        :param addressing: The addressing of this OdxAny.  # noqa: E501
        :type addressing: Addressing
        :param transmission_mode_raw: The transmission_mode_raw of this OdxAny.  # noqa: E501
        :type transmission_mode_raw: TransMode
        :param transmission_mode: The transmission_mode of this OdxAny.  # noqa: E501
        :type transmission_mode: TransMode
        :param request: The request of this OdxAny.  # noqa: E501
        :type request: Request
        :param variable_group_ref: The variable_group_ref of this OdxAny.  # noqa: E501
        :type variable_group_ref: OdxLinkRef
        :param sw_variables: The sw_variables of this OdxAny.  # noqa: E501
        :type sw_variables: List[SwVariable]
        :param comm_relations: The comm_relations of this OdxAny.  # noqa: E501
        :type comm_relations: List[CommRelation]
        :param table_snref: The table_snref of this OdxAny.  # noqa: E501
        :type table_snref: str
        :param table_row_snref: The table_row_snref of this OdxAny.  # noqa: E501
        :type table_row_snref: str
        :param is_read_before_write_raw: The is_read_before_write_raw of this OdxAny.  # noqa: E501
        :type is_read_before_write_raw: bool
        :param is_read_before_write: The is_read_before_write of this OdxAny.  # noqa: E501
        :type is_read_before_write: bool
        :param variable_group: The variable_group of this OdxAny.  # noqa: E501
        :type variable_group: VariableGroup
        :param table: The table of this OdxAny.  # noqa: E501
        :type table: TableResolved
        :param table_row: The table_row of this OdxAny.  # noqa: E501
        :type table_row: TableRowResolved
        :param trouble_code: The trouble_code of this OdxAny.  # noqa: E501
        :type trouble_code: int
        :param display_trouble_code: The display_trouble_code of this OdxAny.  # noqa: E501
        :type display_trouble_code: str
        :param level: The level of this OdxAny.  # noqa: E501
        :type level: int
        :param is_temporary_raw: The is_temporary_raw of this OdxAny.  # noqa: E501
        :type is_temporary_raw: bool
        :param is_temporary: The is_temporary of this OdxAny.  # noqa: E501
        :type is_temporary: bool
        :param _date: The _date of this OdxAny.  # noqa: E501
        :type _date: str
        :param tool: The tool of this OdxAny.  # noqa: E501
        :type tool: str
        :param company_revision_infos: The company_revision_infos of this OdxAny.  # noqa: E501
        :type company_revision_infos: List[CompanyRevisionInfo]
        :param modifications: The modifications of this OdxAny.  # noqa: E501
        :type modifications: List[Modification]
        :param dtc_dop_ref: The dtc_dop_ref of this OdxAny.  # noqa: E501
        :type dtc_dop_ref: OdxLinkRef
        :param dtc_snref: The dtc_snref of this OdxAny.  # noqa: E501
        :type dtc_snref: str
        :param dtc_dop: The dtc_dop of this OdxAny.  # noqa: E501
        :type dtc_dop: DtcDop
        :param dtc: The dtc of this OdxAny.  # noqa: E501
        :type dtc: DiagnosticTroubleCode
        :param dtcs_raw: The dtcs_raw of this OdxAny.  # noqa: E501
        :type dtcs_raw: List[DtcDopDtcsRawInner]
        :param dtcs: The dtcs of this OdxAny.  # noqa: E501
        :type dtcs: List[DiagnosticTroubleCode]
        :param linked_dtc_dops_raw: The linked_dtc_dops_raw of this OdxAny.  # noqa: E501
        :type linked_dtc_dops_raw: List[LinkedDtcDop]
        :param linked_dtc_dops: The linked_dtc_dops of this OdxAny.  # noqa: E501
        :type linked_dtc_dops: List[LinkedDtcDop]
        :param is_visible_raw: The is_visible_raw of this OdxAny.  # noqa: E501
        :type is_visible_raw: bool
        :param is_visible: The is_visible of this OdxAny.  # noqa: E501
        :type is_visible: bool
        :param dyn_id_def_mode_infos: The dyn_id_def_mode_infos of this OdxAny.  # noqa: E501
        :type dyn_id_def_mode_infos: List[DynIdDefModeInfo]
        :param ref_id: The ref_id of this OdxAny.  # noqa: E501
        :type ref_id: str
        :param ref_docs: The ref_docs of this OdxAny.  # noqa: E501
        :type ref_docs: List[OdxDocFragment]
        :param termination_value_raw: The termination_value_raw of this OdxAny.  # noqa: E501
        :type termination_value_raw: str
        :param resolved_object_perma_id: The resolved_object_perma_id of this OdxAny.  # noqa: E501
        :type resolved_object_perma_id: str
        :param resolved_object_ephemeral_id: The resolved_object_ephemeral_id of this OdxAny.  # noqa: E501
        :type resolved_object_ephemeral_id: int
        :param resolved_object_short_name: The resolved_object_short_name of this OdxAny.  # noqa: E501
        :type resolved_object_short_name: str
        :param def_mode: The def_mode of this OdxAny.  # noqa: E501
        :type def_mode: str
        :param clear_dyn_def_message_ref: The clear_dyn_def_message_ref of this OdxAny.  # noqa: E501
        :type clear_dyn_def_message_ref: OdxLinkRef
        :param clear_dyn_def_message_snref: The clear_dyn_def_message_snref of this OdxAny.  # noqa: E501
        :type clear_dyn_def_message_snref: str
        :param read_dyn_def_message_ref: The read_dyn_def_message_ref of this OdxAny.  # noqa: E501
        :type read_dyn_def_message_ref: OdxLinkRef
        :param read_dyn_def_message_snref: The read_dyn_def_message_snref of this OdxAny.  # noqa: E501
        :type read_dyn_def_message_snref: str
        :param dyn_def_message_ref: The dyn_def_message_ref of this OdxAny.  # noqa: E501
        :type dyn_def_message_ref: OdxLinkRef
        :param dyn_def_message_snref: The dyn_def_message_snref of this OdxAny.  # noqa: E501
        :type dyn_def_message_snref: str
        :param supported_dyn_ids: The supported_dyn_ids of this OdxAny.  # noqa: E501
        :type supported_dyn_ids: List[str]
        :param selection_table_refs: The selection_table_refs of this OdxAny.  # noqa: E501
        :type selection_table_refs: List[DynIdDefModeInfoSelectionTableRefsInner]
        :param clear_dyn_def_message: The clear_dyn_def_message of this OdxAny.  # noqa: E501
        :type clear_dyn_def_message: DiagCommResolved
        :param read_dyn_def_message: The read_dyn_def_message of this OdxAny.  # noqa: E501
        :type read_dyn_def_message: DiagCommResolved
        :param dyn_def_message: The dyn_def_message of this OdxAny.  # noqa: E501
        :type dyn_def_message: DiagCommResolved
        :param selection_tables: The selection_tables of this OdxAny.  # noqa: E501
        :type selection_tables: List[Table]
        :param structure_ref: The structure_ref of this OdxAny.  # noqa: E501
        :type structure_ref: OdxLinkRef
        :param structure_snref: The structure_snref of this OdxAny.  # noqa: E501
        :type structure_snref: str
        :param env_data_desc_ref: The env_data_desc_ref of this OdxAny.  # noqa: E501
        :type env_data_desc_ref: OdxLinkRef
        :param env_data_desc_snref: The env_data_desc_snref of this OdxAny.  # noqa: E501
        :type env_data_desc_snref: str
        :param dyn_end_dop_ref: The dyn_end_dop_ref of this OdxAny.  # noqa: E501
        :type dyn_end_dop_ref: DynEndDopRef
        :param structure: The structure of this OdxAny.  # noqa: E501
        :type structure: Structure
        :param dyn_end_dop: The dyn_end_dop of this OdxAny.  # noqa: E501
        :type dyn_end_dop: DataObjectPropertyResolved
        :param offset: The offset of this OdxAny.  # noqa: E501
        :type offset: float
        :param determine_number_of_items: The determine_number_of_items of this OdxAny.  # noqa: E501
        :type determine_number_of_items: DetermineNumberOfItems
        :param config_datas: The config_datas of this OdxAny.  # noqa: E501
        :type config_datas: List[ConfigData]
        :param config_data_dictionary_spec: The config_data_dictionary_spec of this OdxAny.  # noqa: E501
        :type config_data_dictionary_spec: ConfigDataDictionarySpec
        :param group_members: The group_members of this OdxAny.  # noqa: E501
        :type group_members: List[GroupMember]
        :param mem: The mem of this OdxAny.  # noqa: E501
        :type mem: Mem
        :param phys_mem: The phys_mem of this OdxAny.  # noqa: E501
        :type phys_mem: PhysMem
        :param flash_classes: The flash_classes of this OdxAny.  # noqa: E501
        :type flash_classes: List[FlashClass]
        :param session_descs: The session_descs of this OdxAny.  # noqa: E501
        :type session_descs: List[SessionDesc]
        :param ident_descs: The ident_descs of this OdxAny.  # noqa: E501
        :type ident_descs: List[IdentDesc]
        :param ecu_mem_ref: The ecu_mem_ref of this OdxAny.  # noqa: E501
        :type ecu_mem_ref: OdxLinkRef
        :param layer_refs: The layer_refs of this OdxAny.  # noqa: E501
        :type layer_refs: List[OdxLinkRef]
        :param all_variant_refs: The all_variant_refs of this OdxAny.  # noqa: E501
        :type all_variant_refs: List[OdxLinkRef]
        :param ecu_mem: The ecu_mem of this OdxAny.  # noqa: E501
        :type ecu_mem: EcuMem
        :param layers: The layers of this OdxAny.  # noqa: E501
        :type layers: List[EcuMemConnectorResolvedLayersInner]
        :param all_variants: The all_variants of this OdxAny.  # noqa: E501
        :type all_variants: List[BaseVariant]
        :param component_type: The component_type of this OdxAny.  # noqa: E501
        :type component_type: InfoComponentType
        :param matching_components: The matching_components of this OdxAny.  # noqa: E501
        :type matching_components: List[MatchingComponent]
        :param matching_parameters: The matching_parameters of this OdxAny.  # noqa: E501
        :type matching_parameters: List[MatchingParameter]
        :param ecu_variant_patterns: The ecu_variant_patterns of this OdxAny.  # noqa: E501
        :type ecu_variant_patterns: List[EcuVariantPattern]
        :param value_raw: The value_raw of this OdxAny.  # noqa: E501
        :type value_raw: str
        :param max_number_of_items: The max_number_of_items of this OdxAny.  # noqa: E501
        :type max_number_of_items: int
        :param min_number_of_items: The min_number_of_items of this OdxAny.  # noqa: E501
        :type min_number_of_items: int
        :param env_data_snref: The env_data_snref of this OdxAny.  # noqa: E501
        :type env_data_snref: str
        :param env_data_desc: The env_data_desc of this OdxAny.  # noqa: E501
        :type env_data_desc: EnvironmentDataDescription
        :param env_data: The env_data of this OdxAny.  # noqa: E501
        :type env_data: EnvironmentData
        :param all_value: The all_value of this OdxAny.  # noqa: E501
        :type all_value: bool
        :param dtc_values: The dtc_values of this OdxAny.  # noqa: E501
        :type dtc_values: List[int]
        :param param_snref: The param_snref of this OdxAny.  # noqa: E501
        :type param_snref: str
        :param param_snpathref: The param_snpathref of this OdxAny.  # noqa: E501
        :type param_snpathref: str
        :param env_data_refs: The env_data_refs of this OdxAny.  # noqa: E501
        :type env_data_refs: List[OdxLinkRef]
        :param ident_values: The ident_values of this OdxAny.  # noqa: E501
        :type ident_values: List[IdentValue]
        :param size_length: The size_length of this OdxAny.  # noqa: E501
        :type size_length: int
        :param address_length: The address_length of this OdxAny.  # noqa: E501
        :type address_length: int
        :param encrypt_compress_method: The encrypt_compress_method of this OdxAny.  # noqa: E501
        :type encrypt_compress_method: EncryptCompressMethod
        :param method: The method of this OdxAny.  # noqa: E501
        :type method: str
        :param href: The href of this OdxAny.  # noqa: E501
        :type href: str
        :param ecu_mems: The ecu_mems of this OdxAny.  # noqa: E501
        :type ecu_mems: List[EcuMem]
        :param ecu_mem_connectors: The ecu_mem_connectors of this OdxAny.  # noqa: E501
        :type ecu_mem_connectors: List[EcuMemConnector]
        :param logical_link_ref: The logical_link_ref of this OdxAny.  # noqa: E501
        :type logical_link_ref: OdxLinkRef
        :param logical_link: The logical_link of this OdxAny.  # noqa: E501
        :type logical_link: LogicalLink
        :param function_nodes: The function_nodes of this OdxAny.  # noqa: E501
        :type function_nodes: List[FunctionNode]
        :param function_node_groups: The function_node_groups of this OdxAny.  # noqa: E501
        :type function_node_groups: List[FunctionNodeGroup]
        :param function_diag_comm_connector: The function_diag_comm_connector of this OdxAny.  # noqa: E501
        :type function_diag_comm_connector: FunctionDiagCommConnector
        :param function_node_refs: The function_node_refs of this OdxAny.  # noqa: E501
        :type function_node_refs: List[OdxLinkRef]
        :param link_type: The link_type of this OdxAny.  # noqa: E501
        :type link_type: str
        :param gateway_logical_link_refs: The gateway_logical_link_refs of this OdxAny.  # noqa: E501
        :type gateway_logical_link_refs: List[OdxLinkRef]
        :param physical_vehicle_link_ref: The physical_vehicle_link_ref of this OdxAny.  # noqa: E501
        :type physical_vehicle_link_ref: OdxLinkRef
        :param protocol_ref: The protocol_ref of this OdxAny.  # noqa: E501
        :type protocol_ref: OdxLinkRef
        :param functional_group_ref: The functional_group_ref of this OdxAny.  # noqa: E501
        :type functional_group_ref: OdxLinkRef
        :param ecu_proxy_refs: The ecu_proxy_refs of this OdxAny.  # noqa: E501
        :type ecu_proxy_refs: List[OdxLinkRef]
        :param link_comparam_refs_raw: The link_comparam_refs_raw of this OdxAny.  # noqa: E501
        :type link_comparam_refs_raw: List[LinkComparamRef]
        :param link_comparam_refs: The link_comparam_refs of this OdxAny.  # noqa: E501
        :type link_comparam_refs: List[LinkComparamRef]
        :param gateway_logical_links: The gateway_logical_links of this OdxAny.  # noqa: E501
        :type gateway_logical_links: List[GatewayLogicalLink]
        :param physical_vehicle_link: The physical_vehicle_link of this OdxAny.  # noqa: E501
        :type physical_vehicle_link: PhysicalVehicleLinkResolved
        :param protocol: The protocol of this OdxAny.  # noqa: E501
        :type protocol: Protocol
        :param functional_group: The functional_group of this OdxAny.  # noqa: E501
        :type functional_group: FunctionalGroup
        :param ecu_proxies: The ecu_proxies of this OdxAny.  # noqa: E501
        :type ecu_proxies: List[EcuProxy]
        :param prot_stack: The prot_stack of this OdxAny.  # noqa: E501
        :type prot_stack: ProtStack
        :param funct_resolution_link_ref: The funct_resolution_link_ref of this OdxAny.  # noqa: E501
        :type funct_resolution_link_ref: OdxLinkRef
        :param phys_resolution_link_ref: The phys_resolution_link_ref of this OdxAny.  # noqa: E501
        :type phys_resolution_link_ref: OdxLinkRef
        :param funct_resolution_link: The funct_resolution_link of this OdxAny.  # noqa: E501
        :type funct_resolution_link: LogicalLink
        :param phys_resolution_link: The phys_resolution_link of this OdxAny.  # noqa: E501
        :type phys_resolution_link: LogicalLink
        :param ident_if_snref: The ident_if_snref of this OdxAny.  # noqa: E501
        :type ident_if_snref: str
        :param out_param_if_snpathref: The out_param_if_snpathref of this OdxAny.  # noqa: E501
        :type out_param_if_snpathref: str
        :param dop_base_ref: The dop_base_ref of this OdxAny.  # noqa: E501
        :type dop_base_ref: OdxLinkRef
        :param scale_constrs: The scale_constrs of this OdxAny.  # noqa: E501
        :type scale_constrs: List[ScaleConstr]
        :param phys_constant_value: The phys_constant_value of this OdxAny.  # noqa: E501
        :type phys_constant_value: str
        :param meaning: The meaning of this OdxAny.  # noqa: E501
        :type meaning: Text
        :param bit_length: The bit_length of this OdxAny.  # noqa: E501
        :type bit_length: int
        :param dop_snref: The dop_snref of this OdxAny.  # noqa: E501
        :type dop_snref: str
        :param code_file: The code_file of this OdxAny.  # noqa: E501
        :type code_file: str
        :param encryption: The encryption of this OdxAny.  # noqa: E501
        :type encryption: str
        :param syntax: The syntax of this OdxAny.  # noqa: E501
        :type syntax: str
        :param revision: The revision of this OdxAny.  # noqa: E501
        :type revision: str
        :param entrypoint: The entrypoint of this OdxAny.  # noqa: E501
        :type entrypoint: str
        :param interval_type: The interval_type of this OdxAny.  # noqa: E501
        :type interval_type: IntervalType
        :param factor: The factor of this OdxAny.  # noqa: E501
        :type factor: float
        :param denominator: The denominator of this OdxAny.  # noqa: E501
        :type denominator: float
        :param internal_lower_limit: The internal_lower_limit of this OdxAny.  # noqa: E501
        :type internal_lower_limit: Limit
        :param internal_upper_limit: The internal_upper_limit of this OdxAny.  # noqa: E501
        :type internal_upper_limit: Limit
        :param inverse_value: The inverse_value of this OdxAny.  # noqa: E501
        :type inverse_value: CompuRationalCoeffsNumeratorsInner
        :param simple_value: The simple_value of this OdxAny.  # noqa: E501
        :type simple_value: str
        :param complex_value: The complex_value of this OdxAny.  # noqa: E501
        :type complex_value: List[ComparamInstanceValueAnyOfInner]
        :param not_inherited_dtc_snrefs: The not_inherited_dtc_snrefs of this OdxAny.  # noqa: E501
        :type not_inherited_dtc_snrefs: List[str]
        :param not_inherited_dtcs: The not_inherited_dtcs of this OdxAny.  # noqa: E501
        :type not_inherited_dtcs: List[DiagnosticTroubleCode]
        :param expected_value: The expected_value of this OdxAny.  # noqa: E501
        :type expected_value: str
        :param use_physical_addressing_raw: The use_physical_addressing_raw of this OdxAny.  # noqa: E501
        :type use_physical_addressing_raw: bool
        :param use_physical_addressing: The use_physical_addressing of this OdxAny.  # noqa: E501
        :type use_physical_addressing: bool
        :param multiple_ecu_job_ref: The multiple_ecu_job_ref of this OdxAny.  # noqa: E501
        :type multiple_ecu_job_ref: OdxLinkRef
        :param multiple_ecu_job: The multiple_ecu_job of this OdxAny.  # noqa: E501
        :type multiple_ecu_job: MultipleEcuJob
        :param request_byte_position: The request_byte_position of this OdxAny.  # noqa: E501
        :type request_byte_position: int
        :param byte_length: The byte_length of this OdxAny.  # noqa: E501
        :type byte_length: int
        :param sessions: The sessions of this OdxAny.  # noqa: E501
        :type sessions: List[Session]
        :param datablocks: The datablocks of this OdxAny.  # noqa: E501
        :type datablocks: List[Datablock]
        :param flashdatas: The flashdatas of this OdxAny.  # noqa: E501
        :type flashdatas: List[Flashdata]
        :param max_length: The max_length of this OdxAny.  # noqa: E501
        :type max_length: int
        :param min_length: The min_length of this OdxAny.  # noqa: E501
        :type min_length: int
        :param termination: The termination of this OdxAny.  # noqa: E501
        :type termination: Termination
        :param change: The change of this OdxAny.  # noqa: E501
        :type change: str
        :param reason: The reason of this OdxAny.  # noqa: E501
        :type reason: str
        :param prog_codes: The prog_codes of this OdxAny.  # noqa: E501
        :type prog_codes: List[ProgCode]
        :param input_params: The input_params of this OdxAny.  # noqa: E501
        :type input_params: List[InputParam]
        :param output_params: The output_params of this OdxAny.  # noqa: E501
        :type output_params: List[OutputParam]
        :param neg_output_params: The neg_output_params of this OdxAny.  # noqa: E501
        :type neg_output_params: List[NegOutputParam]
        :param diag_layer_refs: The diag_layer_refs of this OdxAny.  # noqa: E501
        :type diag_layer_refs: List[OdxLinkRef]
        :param diag_layers: The diag_layers of this OdxAny.  # noqa: E501
        :type diag_layers: List[DiagLayer]
        :param switch_key: The switch_key of this OdxAny.  # noqa: E501
        :type switch_key: MultiplexerSwitchKey
        :param default_case: The default_case of this OdxAny.  # noqa: E501
        :type default_case: MultiplexerDefaultCase
        :param cases: The cases of this OdxAny.  # noqa: E501
        :type cases: List[MultiplexerCase]
        :param negative_offset: The negative_offset of this OdxAny.  # noqa: E501
        :type negative_offset: int
        :param coded_values_raw: The coded_values_raw of this OdxAny.  # noqa: E501
        :type coded_values_raw: List[str]
        :param coded_values: The coded_values of this OdxAny.  # noqa: E501
        :type coded_values: List[LimitValue]
        :param version: The version of this OdxAny.  # noqa: E501
        :type version: object
        :param doc_fragments: The doc_fragments of this OdxAny.  # noqa: E501
        :type doc_fragments: List[OdxDocFragment]
        :param doc_name: The doc_name of this OdxAny.  # noqa: E501
        :type doc_name: str
        :param doc_type: The doc_type of this OdxAny.  # noqa: E501
        :type doc_type: DocType
        :param local_id: The local_id of this OdxAny.  # noqa: E501
        :type local_id: str
        :param item_values: The item_values of this OdxAny.  # noqa: E501
        :type item_values: List[ItemValue]
        :param write_audience: The write_audience of this OdxAny.  # noqa: E501
        :type write_audience: Audience
        :param read_audience: The read_audience of this OdxAny.  # noqa: E501
        :type read_audience: Audience
        :param ident_value: The ident_value of this OdxAny.  # noqa: E501
        :type ident_value: IdentValue
        :param length_key_ref: The length_key_ref of this OdxAny.  # noqa: E501
        :type length_key_ref: OdxLinkRef
        :param length_key: The length_key of this OdxAny.  # noqa: E501
        :type length_key: LengthKeyParameterResolved
        :param layer_ref: The layer_ref of this OdxAny.  # noqa: E501
        :type layer_ref: OdxLinkRef
        :param not_inherited_diag_comms: The not_inherited_diag_comms of this OdxAny.  # noqa: E501
        :type not_inherited_diag_comms: List[str]
        :param not_inherited_variables: The not_inherited_variables of this OdxAny.  # noqa: E501
        :type not_inherited_variables: List[str]
        :param not_inherited_dops: The not_inherited_dops of this OdxAny.  # noqa: E501
        :type not_inherited_dops: List[str]
        :param not_inherited_tables: The not_inherited_tables of this OdxAny.  # noqa: E501
        :type not_inherited_tables: List[str]
        :param not_inherited_global_neg_responses: The not_inherited_global_neg_responses of this OdxAny.  # noqa: E501
        :type not_inherited_global_neg_responses: List[str]
        :param layer: The layer of this OdxAny.  # noqa: E501
        :type layer: DiagLayer
        :param phys_segments: The phys_segments of this OdxAny.  # noqa: E501
        :type phys_segments: List[PhysSegment]
        :param physical_constant_value: The physical_constant_value of this OdxAny.  # noqa: E501
        :type physical_constant_value: str
        :param length_exp: The length_exp of this OdxAny.  # noqa: E501
        :type length_exp: int
        :param mass_exp: The mass_exp of this OdxAny.  # noqa: E501
        :type mass_exp: int
        :param time_exp: The time_exp of this OdxAny.  # noqa: E501
        :type time_exp: int
        :param current_exp: The current_exp of this OdxAny.  # noqa: E501
        :type current_exp: int
        :param temperature_exp: The temperature_exp of this OdxAny.  # noqa: E501
        :type temperature_exp: int
        :param molar_amount_exp: The molar_amount_exp of this OdxAny.  # noqa: E501
        :type molar_amount_exp: int
        :param luminous_intensity_exp: The luminous_intensity_exp of this OdxAny.  # noqa: E501
        :type luminous_intensity_exp: int
        :param precision: The precision of this OdxAny.  # noqa: E501
        :type precision: int
        :param display_radix: The display_radix of this OdxAny.  # noqa: E501
        :type display_radix: Radix
        :param vehicle_connector_pin_refs: The vehicle_connector_pin_refs of this OdxAny.  # noqa: E501
        :type vehicle_connector_pin_refs: List[OdxLinkRef]
        :param vehicle_connector_pins: The vehicle_connector_pins of this OdxAny.  # noqa: E501
        :type vehicle_connector_pins: List[VehicleConnectorPin]
        :param positive_offset: The positive_offset of this OdxAny.  # noqa: E501
        :type positive_offset: int
        :param bit_mask: The bit_mask of this OdxAny.  # noqa: E501
        :type bit_mask: int
        :param coded_const_snref: The coded_const_snref of this OdxAny.  # noqa: E501
        :type coded_const_snref: str
        :param coded_const_snpathref: The coded_const_snpathref of this OdxAny.  # noqa: E501
        :type coded_const_snpathref: str
        :param value_snref: The value_snref of this OdxAny.  # noqa: E501
        :type value_snref: str
        :param value_snpathref: The value_snpathref of this OdxAny.  # noqa: E501
        :type value_snpathref: str
        :param phys_const_snref: The phys_const_snref of this OdxAny.  # noqa: E501
        :type phys_const_snref: str
        :param phys_const_snpathref: The phys_const_snpathref of this OdxAny.  # noqa: E501
        :type phys_const_snpathref: str
        :param table_key_snref: The table_key_snref of this OdxAny.  # noqa: E501
        :type table_key_snref: str
        :param table_key_snpathref: The table_key_snpathref of this OdxAny.  # noqa: E501
        :type table_key_snpathref: str
        :param in_param_if_snpathref: The in_param_if_snpathref of this OdxAny.  # noqa: E501
        :type in_param_if_snpathref: str
        :param library_refs: The library_refs of this OdxAny.  # noqa: E501
        :type library_refs: List[OdxLinkRef]
        :param pdu_protocol_type: The pdu_protocol_type of this OdxAny.  # noqa: E501
        :type pdu_protocol_type: str
        :param physical_link_type: The physical_link_type of this OdxAny.  # noqa: E501
        :type physical_link_type: str
        :param comparam_subset_refs: The comparam_subset_refs of this OdxAny.  # noqa: E501
        :type comparam_subset_refs: List[OdxLinkRef]
        :param comparam_subsets: The comparam_subsets of this OdxAny.  # noqa: E501
        :type comparam_subsets: List[ComparamSubset]
        :param comparam_spec_ref: The comparam_spec_ref of this OdxAny.  # noqa: E501
        :type comparam_spec_ref: OdxLinkRef
        :param comparam_spec: The comparam_spec of this OdxAny.  # noqa: E501
        :type comparam_spec: ComparamSpec
        :param numerator_coeffs: The numerator_coeffs of this OdxAny.  # noqa: E501
        :type numerator_coeffs: List[CompuRationalCoeffsNumeratorsInner]
        :param denominator_coeffs: The denominator_coeffs of this OdxAny.  # noqa: E501
        :type denominator_coeffs: List[CompuRationalCoeffsNumeratorsInner]
        :param read_param_values: The read_param_values of this OdxAny.  # noqa: E501
        :type read_param_values: List[ReadParamValue]
        :param read_diag_comm_ref: The read_diag_comm_ref of this OdxAny.  # noqa: E501
        :type read_diag_comm_ref: OdxLinkRef
        :param read_diag_comm_snref: The read_diag_comm_snref of this OdxAny.  # noqa: E501
        :type read_diag_comm_snref: str
        :param read_data_snref: The read_data_snref of this OdxAny.  # noqa: E501
        :type read_data_snref: str
        :param read_data_snpathref: The read_data_snpathref of this OdxAny.  # noqa: E501
        :type read_data_snpathref: str
        :param read_diag_comm: The read_diag_comm of this OdxAny.  # noqa: E501
        :type read_diag_comm: DiagComm
        :param xdoc: The xdoc of this OdxAny.  # noqa: E501
        :type xdoc: XDoc
        :param response_type: The response_type of this OdxAny.  # noqa: E501
        :type response_type: ResponseType
        :param validity: The validity of this OdxAny.  # noqa: E501
        :type validity: ValidType
        :param security_method: The security_method of this OdxAny.  # noqa: E501
        :type security_method: ValidityFor
        :param fw_signature: The fw_signature of this OdxAny.  # noqa: E501
        :type fw_signature: ValidityFor
        :param fw_checksum: The fw_checksum of this OdxAny.  # noqa: E501
        :type fw_checksum: ValidityFor
        :param validity_for: The validity_for of this OdxAny.  # noqa: E501
        :type validity_for: ValidityFor
        :param expected_idents: The expected_idents of this OdxAny.  # noqa: E501
        :type expected_idents: List[ExpectedIdent]
        :param checksums: The checksums of this OdxAny.  # noqa: E501
        :type checksums: List[Checksum]
        :param datablock_refs: The datablock_refs of this OdxAny.  # noqa: E501
        :type datablock_refs: List[OdxLinkRef]
        :param partnumber: The partnumber of this OdxAny.  # noqa: E501
        :type partnumber: str
        :param priority: The priority of this OdxAny.  # noqa: E501
        :type priority: int
        :param session_snref: The session_snref of this OdxAny.  # noqa: E501
        :type session_snref: str
        :param flash_class_refs: The flash_class_refs of this OdxAny.  # noqa: E501
        :type flash_class_refs: List[OdxLinkRef]
        :param own_ident: The own_ident of this OdxAny.  # noqa: E501
        :type own_ident: OwnIdent
        :param direction: The direction of this OdxAny.  # noqa: E501
        :type direction: Direction
        :param filter_size: The filter_size of this OdxAny.  # noqa: E501
        :type filter_size: int
        :param size: The size of this OdxAny.  # noqa: E501
        :type size: int
        :param semantic_info: The semantic_info of this OdxAny.  # noqa: E501
        :type semantic_info: str
        :param sdg_caption: The sdg_caption of this OdxAny.  # noqa: E501
        :type sdg_caption: SpecialDataGroupCaption
        :param sdg_caption_ref: The sdg_caption_ref of this OdxAny.  # noqa: E501
        :type sdg_caption_ref: OdxLinkRef
        :param values: The values of this OdxAny.  # noqa: E501
        :type values: List[SpecialDataGroupValuesInner]
        :param is_condensed_raw: The is_condensed_raw of this OdxAny.  # noqa: E501
        :type is_condensed_raw: bool
        :param is_condensed: The is_condensed of this OdxAny.  # noqa: E501
        :type is_condensed: bool
        :param start_state_snref: The start_state_snref of this OdxAny.  # noqa: E501
        :type start_state_snref: str
        :param states: The states of this OdxAny.  # noqa: E501
        :type states: List[State]
        :param start_state: The start_state of this OdxAny.  # noqa: E501
        :type start_state: State
        :param succeeded: The succeeded of this OdxAny.  # noqa: E501
        :type succeeded: bool
        :param source_snref: The source_snref of this OdxAny.  # noqa: E501
        :type source_snref: str
        :param target_snref: The target_snref of this OdxAny.  # noqa: E501
        :type target_snref: str
        :param external_access_method: The external_access_method of this OdxAny.  # noqa: E501
        :type external_access_method: ExternalAccessMethod
        :param fixed_number_of_items: The fixed_number_of_items of this OdxAny.  # noqa: E501
        :type fixed_number_of_items: int
        :param item_byte_size: The item_byte_size of this OdxAny.  # noqa: E501
        :type item_byte_size: int
        :param sub_component_patterns: The sub_component_patterns of this OdxAny.  # noqa: E501
        :type sub_component_patterns: List[SubComponentPattern]
        :param sub_component_param_connectors: The sub_component_param_connectors of this OdxAny.  # noqa: E501
        :type sub_component_param_connectors: List[SubComponentParamConnector]
        :param out_param_if_refs: The out_param_if_refs of this OdxAny.  # noqa: E501
        :type out_param_if_refs: List[str]
        :param in_param_if_refs: The in_param_if_refs of this OdxAny.  # noqa: E501
        :type in_param_if_refs: List[str]
        :param out_param_ifs: The out_param_ifs of this OdxAny.  # noqa: E501
        :type out_param_ifs: List[Parameter]
        :param in_param_ifs: The in_param_ifs of this OdxAny.  # noqa: E501
        :type in_param_ifs: List[Parameter]
        :param origin: The origin of this OdxAny.  # noqa: E501
        :type origin: str
        :param sysparam: The sysparam of this OdxAny.  # noqa: E501
        :type sysparam: str
        :param key_label: The key_label of this OdxAny.  # noqa: E501
        :type key_label: str
        :param struct_label: The struct_label of this OdxAny.  # noqa: E501
        :type struct_label: str
        :param key_dop_ref: The key_dop_ref of this OdxAny.  # noqa: E501
        :type key_dop_ref: OdxLinkRef
        :param table_rows_raw: The table_rows_raw of this OdxAny.  # noqa: E501
        :type table_rows_raw: List[TableTableRowsRawInner]
        :param table_rows: The table_rows of this OdxAny.  # noqa: E501
        :type table_rows: List[TableRow]
        :param table_diag_comm_connectors: The table_diag_comm_connectors of this OdxAny.  # noqa: E501
        :type table_diag_comm_connectors: List[TableDiagCommConnector]
        :param target: The target of this OdxAny.  # noqa: E501
        :type target: RowFragment
        :param table_row_ref: The table_row_ref of this OdxAny.  # noqa: E501
        :type table_row_ref: OdxLinkRef
        :param table_ref: The table_ref of this OdxAny.  # noqa: E501
        :type table_ref: OdxLinkRef
        :param key_dop: The key_dop of this OdxAny.  # noqa: E501
        :type key_dop: DataObjectProperty
        :param key_raw: The key_raw of this OdxAny.  # noqa: E501
        :type key_raw: str
        :param table_key_ref: The table_key_ref of this OdxAny.  # noqa: E501
        :type table_key_ref: OdxLinkRef
        :param table_key: The table_key of this OdxAny.  # noqa: E501
        :type table_key: TableKeyParameterResolved
        :param department: The department of this OdxAny.  # noqa: E501
        :type department: str
        :param address: The address of this OdxAny.  # noqa: E501
        :type address: str
        :param zipcode: The zipcode of this OdxAny.  # noqa: E501
        :type zipcode: str
        :param city: The city of this OdxAny.  # noqa: E501
        :type city: str
        :param phone: The phone of this OdxAny.  # noqa: E501
        :type phone: str
        :param fax: The fax of this OdxAny.  # noqa: E501
        :type fax: str
        :param email: The email of this OdxAny.  # noqa: E501
        :type email: str
        :param display_name: The display_name of this OdxAny.  # noqa: E501
        :type display_name: str
        :param factor_si_to_unit: The factor_si_to_unit of this OdxAny.  # noqa: E501
        :type factor_si_to_unit: float
        :param offset_si_to_unit: The offset_si_to_unit of this OdxAny.  # noqa: E501
        :type offset_si_to_unit: float
        :param physical_dimension_ref: The physical_dimension_ref of this OdxAny.  # noqa: E501
        :type physical_dimension_ref: OdxLinkRef
        :param unit_refs: The unit_refs of this OdxAny.  # noqa: E501
        :type unit_refs: List[OdxLinkRef]
        :param units: The units of this OdxAny.  # noqa: E501
        :type units: List[Unit]
        :param physical_dimension: The physical_dimension of this OdxAny.  # noqa: E501
        :type physical_dimension: PhysicalDimension
        :param unit_groups: The unit_groups of this OdxAny.  # noqa: E501
        :type unit_groups: List[UnitGroup]
        :param physical_dimensions: The physical_dimensions of this OdxAny.  # noqa: E501
        :type physical_dimensions: List[PhysicalDimension]
        :param ecu_variant_snrefs: The ecu_variant_snrefs of this OdxAny.  # noqa: E501
        :type ecu_variant_snrefs: List[str]
        :param base_variant_snref: The base_variant_snref of this OdxAny.  # noqa: E501
        :type base_variant_snref: str
        :param pin_number: The pin_number of this OdxAny.  # noqa: E501
        :type pin_number: int
        :param pin_type: The pin_type of this OdxAny.  # noqa: E501
        :type pin_type: PinType
        :param info_components: The info_components of this OdxAny.  # noqa: E501
        :type info_components: List[InfoComponent]
        :param vehicle_informations: The vehicle_informations of this OdxAny.  # noqa: E501
        :type vehicle_informations: List[VehicleInformation]
        :param info_component_refs: The info_component_refs of this OdxAny.  # noqa: E501
        :type info_component_refs: List[OdxLinkRef]
        :param vehicle_connectors: The vehicle_connectors of this OdxAny.  # noqa: E501
        :type vehicle_connectors: List[VehicleConnector]
        :param logical_links: The logical_links of this OdxAny.  # noqa: E501
        :type logical_links: List[LogicalLink]
        :param ecu_groups: The ecu_groups of this OdxAny.  # noqa: E501
        :type ecu_groups: List[EcuGroup]
        :param physical_vehicle_links: The physical_vehicle_links of this OdxAny.  # noqa: E501
        :type physical_vehicle_links: List[PhysicalVehicleLink]
        :param write_diag_comm_ref: The write_diag_comm_ref of this OdxAny.  # noqa: E501
        :type write_diag_comm_ref: OdxLinkRef
        :param write_diag_comm_snref: The write_diag_comm_snref of this OdxAny.  # noqa: E501
        :type write_diag_comm_snref: str
        :param write_data_snref: The write_data_snref of this OdxAny.  # noqa: E501
        :type write_data_snref: str
        :param write_data_snpathref: The write_data_snpathref of this OdxAny.  # noqa: E501
        :type write_data_snpathref: str
        :param write_diag_comm: The write_diag_comm of this OdxAny.  # noqa: E501
        :type write_diag_comm: DiagComm
        :param write_data: The write_data of this OdxAny.  # noqa: E501
        :type write_data: ValueParameter
        :param number: The number of this OdxAny.  # noqa: E501
        :type number: str
        :param publisher: The publisher of this OdxAny.  # noqa: E501
        :type publisher: str
        :param url: The url of this OdxAny.  # noqa: E501
        :type url: str
        :param position: The position of this OdxAny.  # noqa: E501
        :type position: str
        """
        self.openapi_types = {
            'short_name': str,
            'long_name': str,
            'description': Description,
            'odx_id': OdxLinkId,
            'oid': str,
            'perma_id': str,
            'ephemeral_id': int,
            'class_name': str,
            'filter_start': int,
            'filter_end': int,
            'fillbyte': int,
            'block_size': int,
            'start_address': int,
            'end_address': int,
            'language': str,
            'company_doc_infos': List[CompanyDocInfo],
            'doc_revisions': List[DocRevision],
            'enabled_audience_refs': List[OdxLinkRef],
            'disabled_audience_refs': List[OdxLinkRef],
            'is_supplier_raw': bool,
            'is_supplier': bool,
            'is_development_raw': bool,
            'is_development': bool,
            'is_manufacturing_raw': bool,
            'is_manufacturing': bool,
            'is_aftersales_raw': bool,
            'is_aftersales': bool,
            'is_aftermarket_raw': bool,
            'is_aftermarket': bool,
            'enabled_audiences': List[AdditionalAudience],
            'disabled_audiences': List[AdditionalAudience],
            'param_class': str,
            'cptype': StandardizationLevel,
            'display_level': int,
            'cpusage': Usage,
            'audience': Audience,
            'function_in_params': List[FunctionInParam],
            'function_out_params': List[FunctionOutParam],
            'component_connectors': List[ComponentConnector],
            'multiple_ecu_job_refs': List[OdxLinkRef],
            'admin_data': AdminData,
            'sdg': SpecialDataGroup,
            'multiple_ecu_jobs': List[MultipleEcuJob],
            'diag_layer_raw': DiagLayerRaw,
            'matching_base_variant_parameters': List[MatchingBaseVariantParameter],
            'variant_type': DiagLayerType,
            'company_datas': List[CompanyData1],
            'functional_classes': List[FunctionalClass],
            'diag_data_dictionary_spec': DiagDataDictionarySpec,
            'diag_comms_raw': List[DiagLayerRawDiagCommsRawInner],
            'diag_comms': List[DiagComm],
            'requests': List[Request],
            'positive_responses': List[Response],
            'negative_responses': List[Response],
            'global_negative_responses': List[Response],
            'import_refs': List[OdxLinkRef],
            'state_charts': List[StateChart],
            'additional_audiences': List[AdditionalAudience],
            'sub_components': List[SubComponent],
            'libraries': List[Library],
            'sdgs': List[SpecialDataGroup],
            'comparam_refs': List[ComparamInstance],
            'diag_variables_raw': List[BaseVariantRawDiagVariablesRawInner],
            'diag_variables': List[DiagVariable],
            'variable_groups': List[VariableGroup],
            'dyn_defined_spec': DynDefinedSpec,
            'base_variant_pattern': BaseVariantPattern,
            'parent_refs': List[ParentRef],
            'byte_size': int,
            'parameters': List[Parameter],
            'source_start_address': int,
            'compressed_size': int,
            'checksum_alg': str,
            'source_end_address': int,
            'uncompressed_size': int,
            'checksum_result': ValidityFor,
            'semantic': str,
            'byte_position': int,
            'bit_position': int,
            'coded_value_raw': str,
            'coded_value': LimitValue,
            'diag_coded_type': DiagCodedType,
            'relation_type': str,
            'diag_comm_ref': OdxLinkRef,
            'diag_comm_snref': str,
            'in_param_if_snref': str,
            'out_param_if_snref': str,
            'value_type_raw': CommRelationValueType,
            'value_type': SessionSubElemType,
            'diag_comm': DiagCommResolved,
            'in_param_if': Parameter,
            'out_param_if': Parameter,
            'roles': List[str],
            'team_members': List[TeamMember],
            'company_specific_info': CompanySpecificInfo,
            'company_data_ref': OdxLinkRef,
            'team_member_ref': OdxLinkRef,
            'doc_label': str,
            'company_data': CompanyData1,
            'team_member': TeamMember,
            'revision_label': str,
            'state': str,
            'related_docs': List[RelatedDoc],
            'physical_default_value_raw': str,
            'physical_default_value': LimitValue,
            'dop_ref': OdxLinkRef,
            'value': LimitValue,
            'protocol_snref': str,
            'prot_stack_snref': str,
            'spec_ref': OdxLinkRef,
            'spec': BaseComparam,
            'dop': DopBase,
            'prot_stacks': List[ProtStack],
            'comparams': List[ComparamInstance],
            'complex_comparams': List[ComplexComparam],
            'data_object_props': List[DataObjectProperty],
            'unit_spec': UnitSpec,
            'category': UnitGroupCategory,
            'subparams': List[BaseComparam],
            'allow_multiple_values_raw': bool,
            'allow_multiple_values': bool,
            'ecu_variant_refs': List[OdxLinkRef],
            'base_variant_ref': OdxLinkRef,
            'diag_object_connector': DiagObjectConnector,
            'diag_object_connector_ref': OdxLinkRef,
            'ecu_variants': List[EcuVariant],
            'base_variant': BaseVariant,
            'compu_internal_to_phys': CompuInternalToPhys,
            'compu_phys_to_internal': CompuPhysToInternal,
            'physical_type': DataType,
            'internal_type': DataType,
            'v': str,
            'vt': str,
            'data_type': str,
            'compu_inverse_value': CompuConst,
            'compu_scales': List[CompuScale],
            'prog_code': ProgCode,
            'compu_default_value': CompuDefaultValue,
            'numerators': List[CompuRationalCoeffsNumeratorsInner],
            'denominators': List[CompuRationalCoeffsNumeratorsInner],
            'short_label': str,
            'lower_limit': Limit,
            'upper_limit': Limit,
            'compu_const': CompuConst,
            'compu_rational_coeffs': CompuRationalCoeffs,
            'domain_type': DataType,
            'range_type': DataType,
            'valid_base_variants': List[ValidBaseVariant],
            'config_records': List[ConfigRecord],
            'data_object_prop_ref': OdxLinkRef,
            'data_object_prop_snref': str,
            'data_object_prop': DopBase,
            'config_id_item': ConfigIdItem,
            'diag_comm_data_connectors': List[DiagCommDataConnector],
            'config_id': IdentValue,
            'data_records': List[DataRecord],
            'system_items': List[SystemItem],
            'data_id_item': DataIdItem,
            'option_items': List[OptionItem],
            'default_data_record_snref': str,
            'compu_method': CompuMethod,
            'internal_constr': InternalConstr,
            'unit_ref': OdxLinkRef,
            'physical_constr': InternalConstr,
            'unit': Unit,
            'rule': str,
            'key': LimitValue,
            'data_id': IdentValue,
            'datafile': Datafile,
            'data': str,
            'dataformat': Dataformat,
            'logical_block_index': int,
            'flashdata_ref': OdxLinkRef,
            'filters': List[Filter],
            'segments': List[Segment],
            'target_addr_offset': TargetAddrOffset,
            'own_idents': List[OwnIdent],
            'securities': List[Security],
            'flashdata': Flashdata,
            'latebound_datafile': bool,
            'selection': DataformatSelection,
            'user_selection': str,
            'text': str,
            'external_docs': List[ExternalDoc],
            'text_identifier': str,
            'base_type_encoding': Encoding,
            'base_data_type': DataType,
            'is_highlow_byte_order_raw': bool,
            'is_highlow_byte_order': bool,
            'functional_class_refs': List[OdxLinkRef],
            'protocol_snrefs': List[str],
            'related_diag_comm_refs': List[RelatedDiagCommRef],
            'pre_condition_state_refs': List[PreConditionStateRef],
            'state_transition_refs': List[StateTransitionRef],
            'diagnostic_class': DiagClassType,
            'is_mandatory_raw': bool,
            'is_mandatory': bool,
            'is_executable_raw': bool,
            'is_executable': bool,
            'is_final_raw': bool,
            'is_final': bool,
            'read_diag_comm_connector': ReadDiagCommConnector,
            'write_diag_comm_connector': WriteDiagCommConnector,
            'protocols': List[Protocol],
            'pre_condition_states': List[State],
            'state_transitions': List[StateTransition],
            'dtc_dops': List[DtcDop],
            'env_data_descs': List[EnvironmentDataDescription],
            'structures': List[Structure],
            'static_fields': List[StaticField],
            'dynamic_length_fields': List[DynamicLengthField],
            'dynamic_endmarker_fields': List[DynamicEndmarkerField],
            'end_of_pdu_fields': List[EndOfPduField],
            'muxs': List[Multiplexer],
            'env_datas': List[EnvironmentData],
            'tables': List[Table],
            'functional_groups': List[FunctionalGroup],
            'ecu_shared_datas': List[EcuSharedData],
            'base_variants': List[BaseVariant],
            'function_diag_comm_connectors': List[FunctionDiagCommConnector],
            'table_row_connectors': List[TableRowConnector],
            'env_data_connectors': List[EnvDataConnector],
            'dtc_connectors': List[DtcConnector],
            'request_ref': OdxLinkRef,
            'pos_response_refs': List[OdxLinkRef],
            'neg_response_refs': List[OdxLinkRef],
            'pos_response_suppressible': PosResponseSuppressible,
            'is_cyclic_raw': bool,
            'is_cyclic': bool,
            'is_multiple_raw': bool,
            'is_multiple': bool,
            'addressing_raw': Addressing,
            'addressing': Addressing,
            'transmission_mode_raw': TransMode,
            'transmission_mode': TransMode,
            'request': Request,
            'variable_group_ref': OdxLinkRef,
            'sw_variables': List[SwVariable],
            'comm_relations': List[CommRelation],
            'table_snref': str,
            'table_row_snref': str,
            'is_read_before_write_raw': bool,
            'is_read_before_write': bool,
            'variable_group': VariableGroup,
            'table': TableResolved,
            'table_row': TableRowResolved,
            'trouble_code': int,
            'display_trouble_code': str,
            'level': int,
            'is_temporary_raw': bool,
            'is_temporary': bool,
            '_date': str,
            'tool': str,
            'company_revision_infos': List[CompanyRevisionInfo],
            'modifications': List[Modification],
            'dtc_dop_ref': OdxLinkRef,
            'dtc_snref': str,
            'dtc_dop': DtcDop,
            'dtc': DiagnosticTroubleCode,
            'dtcs_raw': List[DtcDopDtcsRawInner],
            'dtcs': List[DiagnosticTroubleCode],
            'linked_dtc_dops_raw': List[LinkedDtcDop],
            'linked_dtc_dops': List[LinkedDtcDop],
            'is_visible_raw': bool,
            'is_visible': bool,
            'dyn_id_def_mode_infos': List[DynIdDefModeInfo],
            'ref_id': str,
            'ref_docs': List[OdxDocFragment],
            'termination_value_raw': str,
            'resolved_object_perma_id': str,
            'resolved_object_ephemeral_id': int,
            'resolved_object_short_name': str,
            'def_mode': str,
            'clear_dyn_def_message_ref': OdxLinkRef,
            'clear_dyn_def_message_snref': str,
            'read_dyn_def_message_ref': OdxLinkRef,
            'read_dyn_def_message_snref': str,
            'dyn_def_message_ref': OdxLinkRef,
            'dyn_def_message_snref': str,
            'supported_dyn_ids': List[str],
            'selection_table_refs': List[DynIdDefModeInfoSelectionTableRefsInner],
            'clear_dyn_def_message': DiagCommResolved,
            'read_dyn_def_message': DiagCommResolved,
            'dyn_def_message': DiagCommResolved,
            'selection_tables': List[Table],
            'structure_ref': OdxLinkRef,
            'structure_snref': str,
            'env_data_desc_ref': OdxLinkRef,
            'env_data_desc_snref': str,
            'dyn_end_dop_ref': DynEndDopRef,
            'structure': Structure,
            'dyn_end_dop': DataObjectPropertyResolved,
            'offset': float,
            'determine_number_of_items': DetermineNumberOfItems,
            'config_datas': List[ConfigData],
            'config_data_dictionary_spec': ConfigDataDictionarySpec,
            'group_members': List[GroupMember],
            'mem': Mem,
            'phys_mem': PhysMem,
            'flash_classes': List[FlashClass],
            'session_descs': List[SessionDesc],
            'ident_descs': List[IdentDesc],
            'ecu_mem_ref': OdxLinkRef,
            'layer_refs': List[OdxLinkRef],
            'all_variant_refs': List[OdxLinkRef],
            'ecu_mem': EcuMem,
            'layers': List[EcuMemConnectorResolvedLayersInner],
            'all_variants': List[BaseVariant],
            'component_type': InfoComponentType,
            'matching_components': List[MatchingComponent],
            'matching_parameters': List[MatchingParameter],
            'ecu_variant_patterns': List[EcuVariantPattern],
            'value_raw': str,
            'max_number_of_items': int,
            'min_number_of_items': int,
            'env_data_snref': str,
            'env_data_desc': EnvironmentDataDescription,
            'env_data': EnvironmentData,
            'all_value': bool,
            'dtc_values': List[int],
            'param_snref': str,
            'param_snpathref': str,
            'env_data_refs': List[OdxLinkRef],
            'ident_values': List[IdentValue],
            'size_length': int,
            'address_length': int,
            'encrypt_compress_method': EncryptCompressMethod,
            'method': str,
            'href': str,
            'ecu_mems': List[EcuMem],
            'ecu_mem_connectors': List[EcuMemConnector],
            'logical_link_ref': OdxLinkRef,
            'logical_link': LogicalLink,
            'function_nodes': List[FunctionNode],
            'function_node_groups': List[FunctionNodeGroup],
            'function_diag_comm_connector': FunctionDiagCommConnector,
            'function_node_refs': List[OdxLinkRef],
            'link_type': str,
            'gateway_logical_link_refs': List[OdxLinkRef],
            'physical_vehicle_link_ref': OdxLinkRef,
            'protocol_ref': OdxLinkRef,
            'functional_group_ref': OdxLinkRef,
            'ecu_proxy_refs': List[OdxLinkRef],
            'link_comparam_refs_raw': List[LinkComparamRef],
            'link_comparam_refs': List[LinkComparamRef],
            'gateway_logical_links': List[GatewayLogicalLink],
            'physical_vehicle_link': PhysicalVehicleLinkResolved,
            'protocol': Protocol,
            'functional_group': FunctionalGroup,
            'ecu_proxies': List[EcuProxy],
            'prot_stack': ProtStack,
            'funct_resolution_link_ref': OdxLinkRef,
            'phys_resolution_link_ref': OdxLinkRef,
            'funct_resolution_link': LogicalLink,
            'phys_resolution_link': LogicalLink,
            'ident_if_snref': str,
            'out_param_if_snpathref': str,
            'dop_base_ref': OdxLinkRef,
            'scale_constrs': List[ScaleConstr],
            'phys_constant_value': str,
            'meaning': Text,
            'bit_length': int,
            'dop_snref': str,
            'code_file': str,
            'encryption': str,
            'syntax': str,
            'revision': str,
            'entrypoint': str,
            'interval_type': IntervalType,
            'factor': float,
            'denominator': float,
            'internal_lower_limit': Limit,
            'internal_upper_limit': Limit,
            'inverse_value': CompuRationalCoeffsNumeratorsInner,
            'simple_value': str,
            'complex_value': List[ComparamInstanceValueAnyOfInner],
            'not_inherited_dtc_snrefs': List[str],
            'not_inherited_dtcs': List[DiagnosticTroubleCode],
            'expected_value': str,
            'use_physical_addressing_raw': bool,
            'use_physical_addressing': bool,
            'multiple_ecu_job_ref': OdxLinkRef,
            'multiple_ecu_job': MultipleEcuJob,
            'request_byte_position': int,
            'byte_length': int,
            'sessions': List[Session],
            'datablocks': List[Datablock],
            'flashdatas': List[Flashdata],
            'max_length': int,
            'min_length': int,
            'termination': Termination,
            'change': str,
            'reason': str,
            'prog_codes': List[ProgCode],
            'input_params': List[InputParam],
            'output_params': List[OutputParam],
            'neg_output_params': List[NegOutputParam],
            'diag_layer_refs': List[OdxLinkRef],
            'diag_layers': List[DiagLayer],
            'switch_key': MultiplexerSwitchKey,
            'default_case': MultiplexerDefaultCase,
            'cases': List[MultiplexerCase],
            'negative_offset': int,
            'coded_values_raw': List[str],
            'coded_values': List[LimitValue],
            'version': object,
            'doc_fragments': List[OdxDocFragment],
            'doc_name': str,
            'doc_type': DocType,
            'local_id': str,
            'item_values': List[ItemValue],
            'write_audience': Audience,
            'read_audience': Audience,
            'ident_value': IdentValue,
            'length_key_ref': OdxLinkRef,
            'length_key': LengthKeyParameterResolved,
            'layer_ref': OdxLinkRef,
            'not_inherited_diag_comms': List[str],
            'not_inherited_variables': List[str],
            'not_inherited_dops': List[str],
            'not_inherited_tables': List[str],
            'not_inherited_global_neg_responses': List[str],
            'layer': DiagLayer,
            'phys_segments': List[PhysSegment],
            'physical_constant_value': str,
            'length_exp': int,
            'mass_exp': int,
            'time_exp': int,
            'current_exp': int,
            'temperature_exp': int,
            'molar_amount_exp': int,
            'luminous_intensity_exp': int,
            'precision': int,
            'display_radix': Radix,
            'vehicle_connector_pin_refs': List[OdxLinkRef],
            'vehicle_connector_pins': List[VehicleConnectorPin],
            'positive_offset': int,
            'bit_mask': int,
            'coded_const_snref': str,
            'coded_const_snpathref': str,
            'value_snref': str,
            'value_snpathref': str,
            'phys_const_snref': str,
            'phys_const_snpathref': str,
            'table_key_snref': str,
            'table_key_snpathref': str,
            'in_param_if_snpathref': str,
            'library_refs': List[OdxLinkRef],
            'pdu_protocol_type': str,
            'physical_link_type': str,
            'comparam_subset_refs': List[OdxLinkRef],
            'comparam_subsets': List[ComparamSubset],
            'comparam_spec_ref': OdxLinkRef,
            'comparam_spec': ComparamSpec,
            'numerator_coeffs': List[CompuRationalCoeffsNumeratorsInner],
            'denominator_coeffs': List[CompuRationalCoeffsNumeratorsInner],
            'read_param_values': List[ReadParamValue],
            'read_diag_comm_ref': OdxLinkRef,
            'read_diag_comm_snref': str,
            'read_data_snref': str,
            'read_data_snpathref': str,
            'read_diag_comm': DiagComm,
            'xdoc': XDoc,
            'response_type': ResponseType,
            'validity': ValidType,
            'security_method': ValidityFor,
            'fw_signature': ValidityFor,
            'fw_checksum': ValidityFor,
            'validity_for': ValidityFor,
            'expected_idents': List[ExpectedIdent],
            'checksums': List[Checksum],
            'datablock_refs': List[OdxLinkRef],
            'partnumber': str,
            'priority': int,
            'session_snref': str,
            'flash_class_refs': List[OdxLinkRef],
            'own_ident': OwnIdent,
            'direction': Direction,
            'filter_size': int,
            'size': int,
            'semantic_info': str,
            'sdg_caption': SpecialDataGroupCaption,
            'sdg_caption_ref': OdxLinkRef,
            'values': List[SpecialDataGroupValuesInner],
            'is_condensed_raw': bool,
            'is_condensed': bool,
            'start_state_snref': str,
            'states': List[State],
            'start_state': State,
            'succeeded': bool,
            'source_snref': str,
            'target_snref': str,
            'external_access_method': ExternalAccessMethod,
            'fixed_number_of_items': int,
            'item_byte_size': int,
            'sub_component_patterns': List[SubComponentPattern],
            'sub_component_param_connectors': List[SubComponentParamConnector],
            'out_param_if_refs': List[str],
            'in_param_if_refs': List[str],
            'out_param_ifs': List[Parameter],
            'in_param_ifs': List[Parameter],
            'origin': str,
            'sysparam': str,
            'key_label': str,
            'struct_label': str,
            'key_dop_ref': OdxLinkRef,
            'table_rows_raw': List[TableTableRowsRawInner],
            'table_rows': List[TableRow],
            'table_diag_comm_connectors': List[TableDiagCommConnector],
            'target': RowFragment,
            'table_row_ref': OdxLinkRef,
            'table_ref': OdxLinkRef,
            'key_dop': DataObjectProperty,
            'key_raw': str,
            'table_key_ref': OdxLinkRef,
            'table_key': TableKeyParameterResolved,
            'department': str,
            'address': str,
            'zipcode': str,
            'city': str,
            'phone': str,
            'fax': str,
            'email': str,
            'display_name': str,
            'factor_si_to_unit': float,
            'offset_si_to_unit': float,
            'physical_dimension_ref': OdxLinkRef,
            'unit_refs': List[OdxLinkRef],
            'units': List[Unit],
            'physical_dimension': PhysicalDimension,
            'unit_groups': List[UnitGroup],
            'physical_dimensions': List[PhysicalDimension],
            'ecu_variant_snrefs': List[str],
            'base_variant_snref': str,
            'pin_number': int,
            'pin_type': PinType,
            'info_components': List[InfoComponent],
            'vehicle_informations': List[VehicleInformation],
            'info_component_refs': List[OdxLinkRef],
            'vehicle_connectors': List[VehicleConnector],
            'logical_links': List[LogicalLink],
            'ecu_groups': List[EcuGroup],
            'physical_vehicle_links': List[PhysicalVehicleLink],
            'write_diag_comm_ref': OdxLinkRef,
            'write_diag_comm_snref': str,
            'write_data_snref': str,
            'write_data_snpathref': str,
            'write_diag_comm': DiagComm,
            'write_data': ValueParameter,
            'number': str,
            'publisher': str,
            'url': str,
            'position': str
        }

        self.attribute_map = {
            'short_name': 'short_name',
            'long_name': 'long_name',
            'description': 'description',
            'odx_id': 'odx_id',
            'oid': 'oid',
            'perma_id': 'perma_id',
            'ephemeral_id': 'ephemeral_id',
            'class_name': 'class_name',
            'filter_start': 'filter_start',
            'filter_end': 'filter_end',
            'fillbyte': 'fillbyte',
            'block_size': 'block_size',
            'start_address': 'start_address',
            'end_address': 'end_address',
            'language': 'language',
            'company_doc_infos': 'company_doc_infos',
            'doc_revisions': 'doc_revisions',
            'enabled_audience_refs': 'enabled_audience_refs',
            'disabled_audience_refs': 'disabled_audience_refs',
            'is_supplier_raw': 'is_supplier_raw',
            'is_supplier': 'is_supplier',
            'is_development_raw': 'is_development_raw',
            'is_development': 'is_development',
            'is_manufacturing_raw': 'is_manufacturing_raw',
            'is_manufacturing': 'is_manufacturing',
            'is_aftersales_raw': 'is_aftersales_raw',
            'is_aftersales': 'is_aftersales',
            'is_aftermarket_raw': 'is_aftermarket_raw',
            'is_aftermarket': 'is_aftermarket',
            'enabled_audiences': 'enabled_audiences',
            'disabled_audiences': 'disabled_audiences',
            'param_class': 'param_class',
            'cptype': 'cptype',
            'display_level': 'display_level',
            'cpusage': 'cpusage',
            'audience': 'audience',
            'function_in_params': 'function_in_params',
            'function_out_params': 'function_out_params',
            'component_connectors': 'component_connectors',
            'multiple_ecu_job_refs': 'multiple_ecu_job_refs',
            'admin_data': 'admin_data',
            'sdg': 'sdg',
            'multiple_ecu_jobs': 'multiple_ecu_jobs',
            'diag_layer_raw': 'diag_layer_raw',
            'matching_base_variant_parameters': 'matching_base_variant_parameters',
            'variant_type': 'variant_type',
            'company_datas': 'company_datas',
            'functional_classes': 'functional_classes',
            'diag_data_dictionary_spec': 'diag_data_dictionary_spec',
            'diag_comms_raw': 'diag_comms_raw',
            'diag_comms': 'diag_comms',
            'requests': 'requests',
            'positive_responses': 'positive_responses',
            'negative_responses': 'negative_responses',
            'global_negative_responses': 'global_negative_responses',
            'import_refs': 'import_refs',
            'state_charts': 'state_charts',
            'additional_audiences': 'additional_audiences',
            'sub_components': 'sub_components',
            'libraries': 'libraries',
            'sdgs': 'sdgs',
            'comparam_refs': 'comparam_refs',
            'diag_variables_raw': 'diag_variables_raw',
            'diag_variables': 'diag_variables',
            'variable_groups': 'variable_groups',
            'dyn_defined_spec': 'dyn_defined_spec',
            'base_variant_pattern': 'base_variant_pattern',
            'parent_refs': 'parent_refs',
            'byte_size': 'byte_size',
            'parameters': 'parameters',
            'source_start_address': 'source_start_address',
            'compressed_size': 'compressed_size',
            'checksum_alg': 'checksum_alg',
            'source_end_address': 'source_end_address',
            'uncompressed_size': 'uncompressed_size',
            'checksum_result': 'checksum_result',
            'semantic': 'semantic',
            'byte_position': 'byte_position',
            'bit_position': 'bit_position',
            'coded_value_raw': 'coded_value_raw',
            'coded_value': 'coded_value',
            'diag_coded_type': 'diag_coded_type',
            'relation_type': 'relation_type',
            'diag_comm_ref': 'diag_comm_ref',
            'diag_comm_snref': 'diag_comm_snref',
            'in_param_if_snref': 'in_param_if_snref',
            'out_param_if_snref': 'out_param_if_snref',
            'value_type_raw': 'value_type_raw',
            'value_type': 'value_type',
            'diag_comm': 'diag_comm',
            'in_param_if': 'in_param_if',
            'out_param_if': 'out_param_if',
            'roles': 'roles',
            'team_members': 'team_members',
            'company_specific_info': 'company_specific_info',
            'company_data_ref': 'company_data_ref',
            'team_member_ref': 'team_member_ref',
            'doc_label': 'doc_label',
            'company_data': 'company_data',
            'team_member': 'team_member',
            'revision_label': 'revision_label',
            'state': 'state',
            'related_docs': 'related_docs',
            'physical_default_value_raw': 'physical_default_value_raw',
            'physical_default_value': 'physical_default_value',
            'dop_ref': 'dop_ref',
            'value': 'value',
            'protocol_snref': 'protocol_snref',
            'prot_stack_snref': 'prot_stack_snref',
            'spec_ref': 'spec_ref',
            'spec': 'spec',
            'dop': 'dop',
            'prot_stacks': 'prot_stacks',
            'comparams': 'comparams',
            'complex_comparams': 'complex_comparams',
            'data_object_props': 'data_object_props',
            'unit_spec': 'unit_spec',
            'category': 'category',
            'subparams': 'subparams',
            'allow_multiple_values_raw': 'allow_multiple_values_raw',
            'allow_multiple_values': 'allow_multiple_values',
            'ecu_variant_refs': 'ecu_variant_refs',
            'base_variant_ref': 'base_variant_ref',
            'diag_object_connector': 'diag_object_connector',
            'diag_object_connector_ref': 'diag_object_connector_ref',
            'ecu_variants': 'ecu_variants',
            'base_variant': 'base_variant',
            'compu_internal_to_phys': 'compu_internal_to_phys',
            'compu_phys_to_internal': 'compu_phys_to_internal',
            'physical_type': 'physical_type',
            'internal_type': 'internal_type',
            'v': 'v',
            'vt': 'vt',
            'data_type': 'data_type',
            'compu_inverse_value': 'compu_inverse_value',
            'compu_scales': 'compu_scales',
            'prog_code': 'prog_code',
            'compu_default_value': 'compu_default_value',
            'numerators': 'numerators',
            'denominators': 'denominators',
            'short_label': 'short_label',
            'lower_limit': 'lower_limit',
            'upper_limit': 'upper_limit',
            'compu_const': 'compu_const',
            'compu_rational_coeffs': 'compu_rational_coeffs',
            'domain_type': 'domain_type',
            'range_type': 'range_type',
            'valid_base_variants': 'valid_base_variants',
            'config_records': 'config_records',
            'data_object_prop_ref': 'data_object_prop_ref',
            'data_object_prop_snref': 'data_object_prop_snref',
            'data_object_prop': 'data_object_prop',
            'config_id_item': 'config_id_item',
            'diag_comm_data_connectors': 'diag_comm_data_connectors',
            'config_id': 'config_id',
            'data_records': 'data_records',
            'system_items': 'system_items',
            'data_id_item': 'data_id_item',
            'option_items': 'option_items',
            'default_data_record_snref': 'default_data_record_snref',
            'compu_method': 'compu_method',
            'internal_constr': 'internal_constr',
            'unit_ref': 'unit_ref',
            'physical_constr': 'physical_constr',
            'unit': 'unit',
            'rule': 'rule',
            'key': 'key',
            'data_id': 'data_id',
            'datafile': 'datafile',
            'data': 'data',
            'dataformat': 'dataformat',
            'logical_block_index': 'logical_block_index',
            'flashdata_ref': 'flashdata_ref',
            'filters': 'filters',
            'segments': 'segments',
            'target_addr_offset': 'target_addr_offset',
            'own_idents': 'own_idents',
            'securities': 'securities',
            'flashdata': 'flashdata',
            'latebound_datafile': 'latebound_datafile',
            'selection': 'selection',
            'user_selection': 'user_selection',
            'text': 'text',
            'external_docs': 'external_docs',
            'text_identifier': 'text_identifier',
            'base_type_encoding': 'base_type_encoding',
            'base_data_type': 'base_data_type',
            'is_highlow_byte_order_raw': 'is_highlow_byte_order_raw',
            'is_highlow_byte_order': 'is_highlow_byte_order',
            'functional_class_refs': 'functional_class_refs',
            'protocol_snrefs': 'protocol_snrefs',
            'related_diag_comm_refs': 'related_diag_comm_refs',
            'pre_condition_state_refs': 'pre_condition_state_refs',
            'state_transition_refs': 'state_transition_refs',
            'diagnostic_class': 'diagnostic_class',
            'is_mandatory_raw': 'is_mandatory_raw',
            'is_mandatory': 'is_mandatory',
            'is_executable_raw': 'is_executable_raw',
            'is_executable': 'is_executable',
            'is_final_raw': 'is_final_raw',
            'is_final': 'is_final',
            'read_diag_comm_connector': 'read_diag_comm_connector',
            'write_diag_comm_connector': 'write_diag_comm_connector',
            'protocols': 'protocols',
            'pre_condition_states': 'pre_condition_states',
            'state_transitions': 'state_transitions',
            'dtc_dops': 'dtc_dops',
            'env_data_descs': 'env_data_descs',
            'structures': 'structures',
            'static_fields': 'static_fields',
            'dynamic_length_fields': 'dynamic_length_fields',
            'dynamic_endmarker_fields': 'dynamic_endmarker_fields',
            'end_of_pdu_fields': 'end_of_pdu_fields',
            'muxs': 'muxs',
            'env_datas': 'env_datas',
            'tables': 'tables',
            'functional_groups': 'functional_groups',
            'ecu_shared_datas': 'ecu_shared_datas',
            'base_variants': 'base_variants',
            'function_diag_comm_connectors': 'function_diag_comm_connectors',
            'table_row_connectors': 'table_row_connectors',
            'env_data_connectors': 'env_data_connectors',
            'dtc_connectors': 'dtc_connectors',
            'request_ref': 'request_ref',
            'pos_response_refs': 'pos_response_refs',
            'neg_response_refs': 'neg_response_refs',
            'pos_response_suppressible': 'pos_response_suppressible',
            'is_cyclic_raw': 'is_cyclic_raw',
            'is_cyclic': 'is_cyclic',
            'is_multiple_raw': 'is_multiple_raw',
            'is_multiple': 'is_multiple',
            'addressing_raw': 'addressing_raw',
            'addressing': 'addressing',
            'transmission_mode_raw': 'transmission_mode_raw',
            'transmission_mode': 'transmission_mode',
            'request': 'request',
            'variable_group_ref': 'variable_group_ref',
            'sw_variables': 'sw_variables',
            'comm_relations': 'comm_relations',
            'table_snref': 'table_snref',
            'table_row_snref': 'table_row_snref',
            'is_read_before_write_raw': 'is_read_before_write_raw',
            'is_read_before_write': 'is_read_before_write',
            'variable_group': 'variable_group',
            'table': 'table',
            'table_row': 'table_row',
            'trouble_code': 'trouble_code',
            'display_trouble_code': 'display_trouble_code',
            'level': 'level',
            'is_temporary_raw': 'is_temporary_raw',
            'is_temporary': 'is_temporary',
            '_date': 'date',
            'tool': 'tool',
            'company_revision_infos': 'company_revision_infos',
            'modifications': 'modifications',
            'dtc_dop_ref': 'dtc_dop_ref',
            'dtc_snref': 'dtc_snref',
            'dtc_dop': 'dtc_dop',
            'dtc': 'dtc',
            'dtcs_raw': 'dtcs_raw',
            'dtcs': 'dtcs',
            'linked_dtc_dops_raw': 'linked_dtc_dops_raw',
            'linked_dtc_dops': 'linked_dtc_dops',
            'is_visible_raw': 'is_visible_raw',
            'is_visible': 'is_visible',
            'dyn_id_def_mode_infos': 'dyn_id_def_mode_infos',
            'ref_id': 'ref_id',
            'ref_docs': 'ref_docs',
            'termination_value_raw': 'termination_value_raw',
            'resolved_object_perma_id': 'resolved_object_perma_id',
            'resolved_object_ephemeral_id': 'resolved_object_ephemeral_id',
            'resolved_object_short_name': 'resolved_object_short_name',
            'def_mode': 'def_mode',
            'clear_dyn_def_message_ref': 'clear_dyn_def_message_ref',
            'clear_dyn_def_message_snref': 'clear_dyn_def_message_snref',
            'read_dyn_def_message_ref': 'read_dyn_def_message_ref',
            'read_dyn_def_message_snref': 'read_dyn_def_message_snref',
            'dyn_def_message_ref': 'dyn_def_message_ref',
            'dyn_def_message_snref': 'dyn_def_message_snref',
            'supported_dyn_ids': 'supported_dyn_ids',
            'selection_table_refs': 'selection_table_refs',
            'clear_dyn_def_message': 'clear_dyn_def_message',
            'read_dyn_def_message': 'read_dyn_def_message',
            'dyn_def_message': 'dyn_def_message',
            'selection_tables': 'selection_tables',
            'structure_ref': 'structure_ref',
            'structure_snref': 'structure_snref',
            'env_data_desc_ref': 'env_data_desc_ref',
            'env_data_desc_snref': 'env_data_desc_snref',
            'dyn_end_dop_ref': 'dyn_end_dop_ref',
            'structure': 'structure',
            'dyn_end_dop': 'dyn_end_dop',
            'offset': 'offset',
            'determine_number_of_items': 'determine_number_of_items',
            'config_datas': 'config_datas',
            'config_data_dictionary_spec': 'config_data_dictionary_spec',
            'group_members': 'group_members',
            'mem': 'mem',
            'phys_mem': 'phys_mem',
            'flash_classes': 'flash_classes',
            'session_descs': 'session_descs',
            'ident_descs': 'ident_descs',
            'ecu_mem_ref': 'ecu_mem_ref',
            'layer_refs': 'layer_refs',
            'all_variant_refs': 'all_variant_refs',
            'ecu_mem': 'ecu_mem',
            'layers': 'layers',
            'all_variants': 'all_variants',
            'component_type': 'component_type',
            'matching_components': 'matching_components',
            'matching_parameters': 'matching_parameters',
            'ecu_variant_patterns': 'ecu_variant_patterns',
            'value_raw': 'value_raw',
            'max_number_of_items': 'max_number_of_items',
            'min_number_of_items': 'min_number_of_items',
            'env_data_snref': 'env_data_snref',
            'env_data_desc': 'env_data_desc',
            'env_data': 'env_data',
            'all_value': 'all_value',
            'dtc_values': 'dtc_values',
            'param_snref': 'param_snref',
            'param_snpathref': 'param_snpathref',
            'env_data_refs': 'env_data_refs',
            'ident_values': 'ident_values',
            'size_length': 'size_length',
            'address_length': 'address_length',
            'encrypt_compress_method': 'encrypt_compress_method',
            'method': 'method',
            'href': 'href',
            'ecu_mems': 'ecu_mems',
            'ecu_mem_connectors': 'ecu_mem_connectors',
            'logical_link_ref': 'logical_link_ref',
            'logical_link': 'logical_link',
            'function_nodes': 'function_nodes',
            'function_node_groups': 'function_node_groups',
            'function_diag_comm_connector': 'function_diag_comm_connector',
            'function_node_refs': 'function_node_refs',
            'link_type': 'link_type',
            'gateway_logical_link_refs': 'gateway_logical_link_refs',
            'physical_vehicle_link_ref': 'physical_vehicle_link_ref',
            'protocol_ref': 'protocol_ref',
            'functional_group_ref': 'functional_group_ref',
            'ecu_proxy_refs': 'ecu_proxy_refs',
            'link_comparam_refs_raw': 'link_comparam_refs_raw',
            'link_comparam_refs': 'link_comparam_refs',
            'gateway_logical_links': 'gateway_logical_links',
            'physical_vehicle_link': 'physical_vehicle_link',
            'protocol': 'protocol',
            'functional_group': 'functional_group',
            'ecu_proxies': 'ecu_proxies',
            'prot_stack': 'prot_stack',
            'funct_resolution_link_ref': 'funct_resolution_link_ref',
            'phys_resolution_link_ref': 'phys_resolution_link_ref',
            'funct_resolution_link': 'funct_resolution_link',
            'phys_resolution_link': 'phys_resolution_link',
            'ident_if_snref': 'ident_if_snref',
            'out_param_if_snpathref': 'out_param_if_snpathref',
            'dop_base_ref': 'dop_base_ref',
            'scale_constrs': 'scale_constrs',
            'phys_constant_value': 'phys_constant_value',
            'meaning': 'meaning',
            'bit_length': 'bit_length',
            'dop_snref': 'dop_snref',
            'code_file': 'code_file',
            'encryption': 'encryption',
            'syntax': 'syntax',
            'revision': 'revision',
            'entrypoint': 'entrypoint',
            'interval_type': 'interval_type',
            'factor': 'factor',
            'denominator': 'denominator',
            'internal_lower_limit': 'internal_lower_limit',
            'internal_upper_limit': 'internal_upper_limit',
            'inverse_value': 'inverse_value',
            'simple_value': 'simple_value',
            'complex_value': 'complex_value',
            'not_inherited_dtc_snrefs': 'not_inherited_dtc_snrefs',
            'not_inherited_dtcs': 'not_inherited_dtcs',
            'expected_value': 'expected_value',
            'use_physical_addressing_raw': 'use_physical_addressing_raw',
            'use_physical_addressing': 'use_physical_addressing',
            'multiple_ecu_job_ref': 'multiple_ecu_job_ref',
            'multiple_ecu_job': 'multiple_ecu_job',
            'request_byte_position': 'request_byte_position',
            'byte_length': 'byte_length',
            'sessions': 'sessions',
            'datablocks': 'datablocks',
            'flashdatas': 'flashdatas',
            'max_length': 'max_length',
            'min_length': 'min_length',
            'termination': 'termination',
            'change': 'change',
            'reason': 'reason',
            'prog_codes': 'prog_codes',
            'input_params': 'input_params',
            'output_params': 'output_params',
            'neg_output_params': 'neg_output_params',
            'diag_layer_refs': 'diag_layer_refs',
            'diag_layers': 'diag_layers',
            'switch_key': 'switch_key',
            'default_case': 'default_case',
            'cases': 'cases',
            'negative_offset': 'negative_offset',
            'coded_values_raw': 'coded_values_raw',
            'coded_values': 'coded_values',
            'version': 'version',
            'doc_fragments': 'doc_fragments',
            'doc_name': 'doc_name',
            'doc_type': 'doc_type',
            'local_id': 'local_id',
            'item_values': 'item_values',
            'write_audience': 'write_audience',
            'read_audience': 'read_audience',
            'ident_value': 'ident_value',
            'length_key_ref': 'length_key_ref',
            'length_key': 'length_key',
            'layer_ref': 'layer_ref',
            'not_inherited_diag_comms': 'not_inherited_diag_comms',
            'not_inherited_variables': 'not_inherited_variables',
            'not_inherited_dops': 'not_inherited_dops',
            'not_inherited_tables': 'not_inherited_tables',
            'not_inherited_global_neg_responses': 'not_inherited_global_neg_responses',
            'layer': 'layer',
            'phys_segments': 'phys_segments',
            'physical_constant_value': 'physical_constant_value',
            'length_exp': 'length_exp',
            'mass_exp': 'mass_exp',
            'time_exp': 'time_exp',
            'current_exp': 'current_exp',
            'temperature_exp': 'temperature_exp',
            'molar_amount_exp': 'molar_amount_exp',
            'luminous_intensity_exp': 'luminous_intensity_exp',
            'precision': 'precision',
            'display_radix': 'display_radix',
            'vehicle_connector_pin_refs': 'vehicle_connector_pin_refs',
            'vehicle_connector_pins': 'vehicle_connector_pins',
            'positive_offset': 'positive_offset',
            'bit_mask': 'bit_mask',
            'coded_const_snref': 'coded_const_snref',
            'coded_const_snpathref': 'coded_const_snpathref',
            'value_snref': 'value_snref',
            'value_snpathref': 'value_snpathref',
            'phys_const_snref': 'phys_const_snref',
            'phys_const_snpathref': 'phys_const_snpathref',
            'table_key_snref': 'table_key_snref',
            'table_key_snpathref': 'table_key_snpathref',
            'in_param_if_snpathref': 'in_param_if_snpathref',
            'library_refs': 'library_refs',
            'pdu_protocol_type': 'pdu_protocol_type',
            'physical_link_type': 'physical_link_type',
            'comparam_subset_refs': 'comparam_subset_refs',
            'comparam_subsets': 'comparam_subsets',
            'comparam_spec_ref': 'comparam_spec_ref',
            'comparam_spec': 'comparam_spec',
            'numerator_coeffs': 'numerator_coeffs',
            'denominator_coeffs': 'denominator_coeffs',
            'read_param_values': 'read_param_values',
            'read_diag_comm_ref': 'read_diag_comm_ref',
            'read_diag_comm_snref': 'read_diag_comm_snref',
            'read_data_snref': 'read_data_snref',
            'read_data_snpathref': 'read_data_snpathref',
            'read_diag_comm': 'read_diag_comm',
            'xdoc': 'xdoc',
            'response_type': 'response_type',
            'validity': 'validity',
            'security_method': 'security_method',
            'fw_signature': 'fw_signature',
            'fw_checksum': 'fw_checksum',
            'validity_for': 'validity_for',
            'expected_idents': 'expected_idents',
            'checksums': 'checksums',
            'datablock_refs': 'datablock_refs',
            'partnumber': 'partnumber',
            'priority': 'priority',
            'session_snref': 'session_snref',
            'flash_class_refs': 'flash_class_refs',
            'own_ident': 'own_ident',
            'direction': 'direction',
            'filter_size': 'filter_size',
            'size': 'size',
            'semantic_info': 'semantic_info',
            'sdg_caption': 'sdg_caption',
            'sdg_caption_ref': 'sdg_caption_ref',
            'values': 'values',
            'is_condensed_raw': 'is_condensed_raw',
            'is_condensed': 'is_condensed',
            'start_state_snref': 'start_state_snref',
            'states': 'states',
            'start_state': 'start_state',
            'succeeded': 'succeeded',
            'source_snref': 'source_snref',
            'target_snref': 'target_snref',
            'external_access_method': 'external_access_method',
            'fixed_number_of_items': 'fixed_number_of_items',
            'item_byte_size': 'item_byte_size',
            'sub_component_patterns': 'sub_component_patterns',
            'sub_component_param_connectors': 'sub_component_param_connectors',
            'out_param_if_refs': 'out_param_if_refs',
            'in_param_if_refs': 'in_param_if_refs',
            'out_param_ifs': 'out_param_ifs',
            'in_param_ifs': 'in_param_ifs',
            'origin': 'origin',
            'sysparam': 'sysparam',
            'key_label': 'key_label',
            'struct_label': 'struct_label',
            'key_dop_ref': 'key_dop_ref',
            'table_rows_raw': 'table_rows_raw',
            'table_rows': 'table_rows',
            'table_diag_comm_connectors': 'table_diag_comm_connectors',
            'target': 'target',
            'table_row_ref': 'table_row_ref',
            'table_ref': 'table_ref',
            'key_dop': 'key_dop',
            'key_raw': 'key_raw',
            'table_key_ref': 'table_key_ref',
            'table_key': 'table_key',
            'department': 'department',
            'address': 'address',
            'zipcode': 'zipcode',
            'city': 'city',
            'phone': 'phone',
            'fax': 'fax',
            'email': 'email',
            'display_name': 'display_name',
            'factor_si_to_unit': 'factor_si_to_unit',
            'offset_si_to_unit': 'offset_si_to_unit',
            'physical_dimension_ref': 'physical_dimension_ref',
            'unit_refs': 'unit_refs',
            'units': 'units',
            'physical_dimension': 'physical_dimension',
            'unit_groups': 'unit_groups',
            'physical_dimensions': 'physical_dimensions',
            'ecu_variant_snrefs': 'ecu_variant_snrefs',
            'base_variant_snref': 'base_variant_snref',
            'pin_number': 'pin_number',
            'pin_type': 'pin_type',
            'info_components': 'info_components',
            'vehicle_informations': 'vehicle_informations',
            'info_component_refs': 'info_component_refs',
            'vehicle_connectors': 'vehicle_connectors',
            'logical_links': 'logical_links',
            'ecu_groups': 'ecu_groups',
            'physical_vehicle_links': 'physical_vehicle_links',
            'write_diag_comm_ref': 'write_diag_comm_ref',
            'write_diag_comm_snref': 'write_diag_comm_snref',
            'write_data_snref': 'write_data_snref',
            'write_data_snpathref': 'write_data_snpathref',
            'write_diag_comm': 'write_diag_comm',
            'write_data': 'write_data',
            'number': 'number',
            'publisher': 'publisher',
            'url': 'url',
            'position': 'position'
        }

        self._short_name = short_name
        self._long_name = long_name
        self._description = description
        self._odx_id = odx_id
        self._oid = oid
        self._perma_id = perma_id
        self._ephemeral_id = ephemeral_id
        self._class_name = class_name
        self._filter_start = filter_start
        self._filter_end = filter_end
        self._fillbyte = fillbyte
        self._block_size = block_size
        self._start_address = start_address
        self._end_address = end_address
        self._language = language
        self._company_doc_infos = company_doc_infos
        self._doc_revisions = doc_revisions
        self._enabled_audience_refs = enabled_audience_refs
        self._disabled_audience_refs = disabled_audience_refs
        self._is_supplier_raw = is_supplier_raw
        self._is_supplier = is_supplier
        self._is_development_raw = is_development_raw
        self._is_development = is_development
        self._is_manufacturing_raw = is_manufacturing_raw
        self._is_manufacturing = is_manufacturing
        self._is_aftersales_raw = is_aftersales_raw
        self._is_aftersales = is_aftersales
        self._is_aftermarket_raw = is_aftermarket_raw
        self._is_aftermarket = is_aftermarket
        self._enabled_audiences = enabled_audiences
        self._disabled_audiences = disabled_audiences
        self._param_class = param_class
        self._cptype = cptype
        self._display_level = display_level
        self._cpusage = cpusage
        self._audience = audience
        self._function_in_params = function_in_params
        self._function_out_params = function_out_params
        self._component_connectors = component_connectors
        self._multiple_ecu_job_refs = multiple_ecu_job_refs
        self._admin_data = admin_data
        self._sdg = sdg
        self._multiple_ecu_jobs = multiple_ecu_jobs
        self._diag_layer_raw = diag_layer_raw
        self._matching_base_variant_parameters = matching_base_variant_parameters
        self._variant_type = variant_type
        self._company_datas = company_datas
        self._functional_classes = functional_classes
        self._diag_data_dictionary_spec = diag_data_dictionary_spec
        self._diag_comms_raw = diag_comms_raw
        self._diag_comms = diag_comms
        self._requests = requests
        self._positive_responses = positive_responses
        self._negative_responses = negative_responses
        self._global_negative_responses = global_negative_responses
        self._import_refs = import_refs
        self._state_charts = state_charts
        self._additional_audiences = additional_audiences
        self._sub_components = sub_components
        self._libraries = libraries
        self._sdgs = sdgs
        self._comparam_refs = comparam_refs
        self._diag_variables_raw = diag_variables_raw
        self._diag_variables = diag_variables
        self._variable_groups = variable_groups
        self._dyn_defined_spec = dyn_defined_spec
        self._base_variant_pattern = base_variant_pattern
        self._parent_refs = parent_refs
        self._byte_size = byte_size
        self._parameters = parameters
        self._source_start_address = source_start_address
        self._compressed_size = compressed_size
        self._checksum_alg = checksum_alg
        self._source_end_address = source_end_address
        self._uncompressed_size = uncompressed_size
        self._checksum_result = checksum_result
        self._semantic = semantic
        self._byte_position = byte_position
        self._bit_position = bit_position
        self._coded_value_raw = coded_value_raw
        self._coded_value = coded_value
        self._diag_coded_type = diag_coded_type
        self._relation_type = relation_type
        self._diag_comm_ref = diag_comm_ref
        self._diag_comm_snref = diag_comm_snref
        self._in_param_if_snref = in_param_if_snref
        self._out_param_if_snref = out_param_if_snref
        self._value_type_raw = value_type_raw
        self._value_type = value_type
        self._diag_comm = diag_comm
        self._in_param_if = in_param_if
        self._out_param_if = out_param_if
        self._roles = roles
        self._team_members = team_members
        self._company_specific_info = company_specific_info
        self._company_data_ref = company_data_ref
        self._team_member_ref = team_member_ref
        self._doc_label = doc_label
        self._company_data = company_data
        self._team_member = team_member
        self._revision_label = revision_label
        self._state = state
        self._related_docs = related_docs
        self._physical_default_value_raw = physical_default_value_raw
        self._physical_default_value = physical_default_value
        self._dop_ref = dop_ref
        self._value = value
        self._protocol_snref = protocol_snref
        self._prot_stack_snref = prot_stack_snref
        self._spec_ref = spec_ref
        self._spec = spec
        self._dop = dop
        self._prot_stacks = prot_stacks
        self._comparams = comparams
        self._complex_comparams = complex_comparams
        self._data_object_props = data_object_props
        self._unit_spec = unit_spec
        self._category = category
        self._subparams = subparams
        self._allow_multiple_values_raw = allow_multiple_values_raw
        self._allow_multiple_values = allow_multiple_values
        self._ecu_variant_refs = ecu_variant_refs
        self._base_variant_ref = base_variant_ref
        self._diag_object_connector = diag_object_connector
        self._diag_object_connector_ref = diag_object_connector_ref
        self._ecu_variants = ecu_variants
        self._base_variant = base_variant
        self._compu_internal_to_phys = compu_internal_to_phys
        self._compu_phys_to_internal = compu_phys_to_internal
        self._physical_type = physical_type
        self._internal_type = internal_type
        self._v = v
        self._vt = vt
        self._data_type = data_type
        self._compu_inverse_value = compu_inverse_value
        self._compu_scales = compu_scales
        self._prog_code = prog_code
        self._compu_default_value = compu_default_value
        self._numerators = numerators
        self._denominators = denominators
        self._short_label = short_label
        self._lower_limit = lower_limit
        self._upper_limit = upper_limit
        self._compu_const = compu_const
        self._compu_rational_coeffs = compu_rational_coeffs
        self._domain_type = domain_type
        self._range_type = range_type
        self._valid_base_variants = valid_base_variants
        self._config_records = config_records
        self._data_object_prop_ref = data_object_prop_ref
        self._data_object_prop_snref = data_object_prop_snref
        self._data_object_prop = data_object_prop
        self._config_id_item = config_id_item
        self._diag_comm_data_connectors = diag_comm_data_connectors
        self._config_id = config_id
        self._data_records = data_records
        self._system_items = system_items
        self._data_id_item = data_id_item
        self._option_items = option_items
        self._default_data_record_snref = default_data_record_snref
        self._compu_method = compu_method
        self._internal_constr = internal_constr
        self._unit_ref = unit_ref
        self._physical_constr = physical_constr
        self._unit = unit
        self._rule = rule
        self._key = key
        self._data_id = data_id
        self._datafile = datafile
        self._data = data
        self._dataformat = dataformat
        self._logical_block_index = logical_block_index
        self._flashdata_ref = flashdata_ref
        self._filters = filters
        self._segments = segments
        self._target_addr_offset = target_addr_offset
        self._own_idents = own_idents
        self._securities = securities
        self._flashdata = flashdata
        self._latebound_datafile = latebound_datafile
        self._selection = selection
        self._user_selection = user_selection
        self._text = text
        self._external_docs = external_docs
        self._text_identifier = text_identifier
        self._base_type_encoding = base_type_encoding
        self._base_data_type = base_data_type
        self._is_highlow_byte_order_raw = is_highlow_byte_order_raw
        self._is_highlow_byte_order = is_highlow_byte_order
        self._functional_class_refs = functional_class_refs
        self._protocol_snrefs = protocol_snrefs
        self._related_diag_comm_refs = related_diag_comm_refs
        self._pre_condition_state_refs = pre_condition_state_refs
        self._state_transition_refs = state_transition_refs
        self._diagnostic_class = diagnostic_class
        self._is_mandatory_raw = is_mandatory_raw
        self._is_mandatory = is_mandatory
        self._is_executable_raw = is_executable_raw
        self._is_executable = is_executable
        self._is_final_raw = is_final_raw
        self._is_final = is_final
        self._read_diag_comm_connector = read_diag_comm_connector
        self._write_diag_comm_connector = write_diag_comm_connector
        self._protocols = protocols
        self._pre_condition_states = pre_condition_states
        self._state_transitions = state_transitions
        self._dtc_dops = dtc_dops
        self._env_data_descs = env_data_descs
        self._structures = structures
        self._static_fields = static_fields
        self._dynamic_length_fields = dynamic_length_fields
        self._dynamic_endmarker_fields = dynamic_endmarker_fields
        self._end_of_pdu_fields = end_of_pdu_fields
        self._muxs = muxs
        self._env_datas = env_datas
        self._tables = tables
        self._functional_groups = functional_groups
        self._ecu_shared_datas = ecu_shared_datas
        self._base_variants = base_variants
        self._function_diag_comm_connectors = function_diag_comm_connectors
        self._table_row_connectors = table_row_connectors
        self._env_data_connectors = env_data_connectors
        self._dtc_connectors = dtc_connectors
        self._request_ref = request_ref
        self._pos_response_refs = pos_response_refs
        self._neg_response_refs = neg_response_refs
        self._pos_response_suppressible = pos_response_suppressible
        self._is_cyclic_raw = is_cyclic_raw
        self._is_cyclic = is_cyclic
        self._is_multiple_raw = is_multiple_raw
        self._is_multiple = is_multiple
        self._addressing_raw = addressing_raw
        self._addressing = addressing
        self._transmission_mode_raw = transmission_mode_raw
        self._transmission_mode = transmission_mode
        self._request = request
        self._variable_group_ref = variable_group_ref
        self._sw_variables = sw_variables
        self._comm_relations = comm_relations
        self._table_snref = table_snref
        self._table_row_snref = table_row_snref
        self._is_read_before_write_raw = is_read_before_write_raw
        self._is_read_before_write = is_read_before_write
        self._variable_group = variable_group
        self._table = table
        self._table_row = table_row
        self._trouble_code = trouble_code
        self._display_trouble_code = display_trouble_code
        self._level = level
        self._is_temporary_raw = is_temporary_raw
        self._is_temporary = is_temporary
        self.__date = _date
        self._tool = tool
        self._company_revision_infos = company_revision_infos
        self._modifications = modifications
        self._dtc_dop_ref = dtc_dop_ref
        self._dtc_snref = dtc_snref
        self._dtc_dop = dtc_dop
        self._dtc = dtc
        self._dtcs_raw = dtcs_raw
        self._dtcs = dtcs
        self._linked_dtc_dops_raw = linked_dtc_dops_raw
        self._linked_dtc_dops = linked_dtc_dops
        self._is_visible_raw = is_visible_raw
        self._is_visible = is_visible
        self._dyn_id_def_mode_infos = dyn_id_def_mode_infos
        self._ref_id = ref_id
        self._ref_docs = ref_docs
        self._termination_value_raw = termination_value_raw
        self._resolved_object_perma_id = resolved_object_perma_id
        self._resolved_object_ephemeral_id = resolved_object_ephemeral_id
        self._resolved_object_short_name = resolved_object_short_name
        self._def_mode = def_mode
        self._clear_dyn_def_message_ref = clear_dyn_def_message_ref
        self._clear_dyn_def_message_snref = clear_dyn_def_message_snref
        self._read_dyn_def_message_ref = read_dyn_def_message_ref
        self._read_dyn_def_message_snref = read_dyn_def_message_snref
        self._dyn_def_message_ref = dyn_def_message_ref
        self._dyn_def_message_snref = dyn_def_message_snref
        self._supported_dyn_ids = supported_dyn_ids
        self._selection_table_refs = selection_table_refs
        self._clear_dyn_def_message = clear_dyn_def_message
        self._read_dyn_def_message = read_dyn_def_message
        self._dyn_def_message = dyn_def_message
        self._selection_tables = selection_tables
        self._structure_ref = structure_ref
        self._structure_snref = structure_snref
        self._env_data_desc_ref = env_data_desc_ref
        self._env_data_desc_snref = env_data_desc_snref
        self._dyn_end_dop_ref = dyn_end_dop_ref
        self._structure = structure
        self._dyn_end_dop = dyn_end_dop
        self._offset = offset
        self._determine_number_of_items = determine_number_of_items
        self._config_datas = config_datas
        self._config_data_dictionary_spec = config_data_dictionary_spec
        self._group_members = group_members
        self._mem = mem
        self._phys_mem = phys_mem
        self._flash_classes = flash_classes
        self._session_descs = session_descs
        self._ident_descs = ident_descs
        self._ecu_mem_ref = ecu_mem_ref
        self._layer_refs = layer_refs
        self._all_variant_refs = all_variant_refs
        self._ecu_mem = ecu_mem
        self._layers = layers
        self._all_variants = all_variants
        self._component_type = component_type
        self._matching_components = matching_components
        self._matching_parameters = matching_parameters
        self._ecu_variant_patterns = ecu_variant_patterns
        self._value_raw = value_raw
        self._max_number_of_items = max_number_of_items
        self._min_number_of_items = min_number_of_items
        self._env_data_snref = env_data_snref
        self._env_data_desc = env_data_desc
        self._env_data = env_data
        self._all_value = all_value
        self._dtc_values = dtc_values
        self._param_snref = param_snref
        self._param_snpathref = param_snpathref
        self._env_data_refs = env_data_refs
        self._ident_values = ident_values
        self._size_length = size_length
        self._address_length = address_length
        self._encrypt_compress_method = encrypt_compress_method
        self._method = method
        self._href = href
        self._ecu_mems = ecu_mems
        self._ecu_mem_connectors = ecu_mem_connectors
        self._logical_link_ref = logical_link_ref
        self._logical_link = logical_link
        self._function_nodes = function_nodes
        self._function_node_groups = function_node_groups
        self._function_diag_comm_connector = function_diag_comm_connector
        self._function_node_refs = function_node_refs
        self._link_type = link_type
        self._gateway_logical_link_refs = gateway_logical_link_refs
        self._physical_vehicle_link_ref = physical_vehicle_link_ref
        self._protocol_ref = protocol_ref
        self._functional_group_ref = functional_group_ref
        self._ecu_proxy_refs = ecu_proxy_refs
        self._link_comparam_refs_raw = link_comparam_refs_raw
        self._link_comparam_refs = link_comparam_refs
        self._gateway_logical_links = gateway_logical_links
        self._physical_vehicle_link = physical_vehicle_link
        self._protocol = protocol
        self._functional_group = functional_group
        self._ecu_proxies = ecu_proxies
        self._prot_stack = prot_stack
        self._funct_resolution_link_ref = funct_resolution_link_ref
        self._phys_resolution_link_ref = phys_resolution_link_ref
        self._funct_resolution_link = funct_resolution_link
        self._phys_resolution_link = phys_resolution_link
        self._ident_if_snref = ident_if_snref
        self._out_param_if_snpathref = out_param_if_snpathref
        self._dop_base_ref = dop_base_ref
        self._scale_constrs = scale_constrs
        self._phys_constant_value = phys_constant_value
        self._meaning = meaning
        self._bit_length = bit_length
        self._dop_snref = dop_snref
        self._code_file = code_file
        self._encryption = encryption
        self._syntax = syntax
        self._revision = revision
        self._entrypoint = entrypoint
        self._interval_type = interval_type
        self._factor = factor
        self._denominator = denominator
        self._internal_lower_limit = internal_lower_limit
        self._internal_upper_limit = internal_upper_limit
        self._inverse_value = inverse_value
        self._simple_value = simple_value
        self._complex_value = complex_value
        self._not_inherited_dtc_snrefs = not_inherited_dtc_snrefs
        self._not_inherited_dtcs = not_inherited_dtcs
        self._expected_value = expected_value
        self._use_physical_addressing_raw = use_physical_addressing_raw
        self._use_physical_addressing = use_physical_addressing
        self._multiple_ecu_job_ref = multiple_ecu_job_ref
        self._multiple_ecu_job = multiple_ecu_job
        self._request_byte_position = request_byte_position
        self._byte_length = byte_length
        self._sessions = sessions
        self._datablocks = datablocks
        self._flashdatas = flashdatas
        self._max_length = max_length
        self._min_length = min_length
        self._termination = termination
        self._change = change
        self._reason = reason
        self._prog_codes = prog_codes
        self._input_params = input_params
        self._output_params = output_params
        self._neg_output_params = neg_output_params
        self._diag_layer_refs = diag_layer_refs
        self._diag_layers = diag_layers
        self._switch_key = switch_key
        self._default_case = default_case
        self._cases = cases
        self._negative_offset = negative_offset
        self._coded_values_raw = coded_values_raw
        self._coded_values = coded_values
        self._version = version
        self._doc_fragments = doc_fragments
        self._doc_name = doc_name
        self._doc_type = doc_type
        self._local_id = local_id
        self._item_values = item_values
        self._write_audience = write_audience
        self._read_audience = read_audience
        self._ident_value = ident_value
        self._length_key_ref = length_key_ref
        self._length_key = length_key
        self._layer_ref = layer_ref
        self._not_inherited_diag_comms = not_inherited_diag_comms
        self._not_inherited_variables = not_inherited_variables
        self._not_inherited_dops = not_inherited_dops
        self._not_inherited_tables = not_inherited_tables
        self._not_inherited_global_neg_responses = not_inherited_global_neg_responses
        self._layer = layer
        self._phys_segments = phys_segments
        self._physical_constant_value = physical_constant_value
        self._length_exp = length_exp
        self._mass_exp = mass_exp
        self._time_exp = time_exp
        self._current_exp = current_exp
        self._temperature_exp = temperature_exp
        self._molar_amount_exp = molar_amount_exp
        self._luminous_intensity_exp = luminous_intensity_exp
        self._precision = precision
        self._display_radix = display_radix
        self._vehicle_connector_pin_refs = vehicle_connector_pin_refs
        self._vehicle_connector_pins = vehicle_connector_pins
        self._positive_offset = positive_offset
        self._bit_mask = bit_mask
        self._coded_const_snref = coded_const_snref
        self._coded_const_snpathref = coded_const_snpathref
        self._value_snref = value_snref
        self._value_snpathref = value_snpathref
        self._phys_const_snref = phys_const_snref
        self._phys_const_snpathref = phys_const_snpathref
        self._table_key_snref = table_key_snref
        self._table_key_snpathref = table_key_snpathref
        self._in_param_if_snpathref = in_param_if_snpathref
        self._library_refs = library_refs
        self._pdu_protocol_type = pdu_protocol_type
        self._physical_link_type = physical_link_type
        self._comparam_subset_refs = comparam_subset_refs
        self._comparam_subsets = comparam_subsets
        self._comparam_spec_ref = comparam_spec_ref
        self._comparam_spec = comparam_spec
        self._numerator_coeffs = numerator_coeffs
        self._denominator_coeffs = denominator_coeffs
        self._read_param_values = read_param_values
        self._read_diag_comm_ref = read_diag_comm_ref
        self._read_diag_comm_snref = read_diag_comm_snref
        self._read_data_snref = read_data_snref
        self._read_data_snpathref = read_data_snpathref
        self._read_diag_comm = read_diag_comm
        self._xdoc = xdoc
        self._response_type = response_type
        self._validity = validity
        self._security_method = security_method
        self._fw_signature = fw_signature
        self._fw_checksum = fw_checksum
        self._validity_for = validity_for
        self._expected_idents = expected_idents
        self._checksums = checksums
        self._datablock_refs = datablock_refs
        self._partnumber = partnumber
        self._priority = priority
        self._session_snref = session_snref
        self._flash_class_refs = flash_class_refs
        self._own_ident = own_ident
        self._direction = direction
        self._filter_size = filter_size
        self._size = size
        self._semantic_info = semantic_info
        self._sdg_caption = sdg_caption
        self._sdg_caption_ref = sdg_caption_ref
        self._values = values
        self._is_condensed_raw = is_condensed_raw
        self._is_condensed = is_condensed
        self._start_state_snref = start_state_snref
        self._states = states
        self._start_state = start_state
        self._succeeded = succeeded
        self._source_snref = source_snref
        self._target_snref = target_snref
        self._external_access_method = external_access_method
        self._fixed_number_of_items = fixed_number_of_items
        self._item_byte_size = item_byte_size
        self._sub_component_patterns = sub_component_patterns
        self._sub_component_param_connectors = sub_component_param_connectors
        self._out_param_if_refs = out_param_if_refs
        self._in_param_if_refs = in_param_if_refs
        self._out_param_ifs = out_param_ifs
        self._in_param_ifs = in_param_ifs
        self._origin = origin
        self._sysparam = sysparam
        self._key_label = key_label
        self._struct_label = struct_label
        self._key_dop_ref = key_dop_ref
        self._table_rows_raw = table_rows_raw
        self._table_rows = table_rows
        self._table_diag_comm_connectors = table_diag_comm_connectors
        self._target = target
        self._table_row_ref = table_row_ref
        self._table_ref = table_ref
        self._key_dop = key_dop
        self._key_raw = key_raw
        self._table_key_ref = table_key_ref
        self._table_key = table_key
        self._department = department
        self._address = address
        self._zipcode = zipcode
        self._city = city
        self._phone = phone
        self._fax = fax
        self._email = email
        self._display_name = display_name
        self._factor_si_to_unit = factor_si_to_unit
        self._offset_si_to_unit = offset_si_to_unit
        self._physical_dimension_ref = physical_dimension_ref
        self._unit_refs = unit_refs
        self._units = units
        self._physical_dimension = physical_dimension
        self._unit_groups = unit_groups
        self._physical_dimensions = physical_dimensions
        self._ecu_variant_snrefs = ecu_variant_snrefs
        self._base_variant_snref = base_variant_snref
        self._pin_number = pin_number
        self._pin_type = pin_type
        self._info_components = info_components
        self._vehicle_informations = vehicle_informations
        self._info_component_refs = info_component_refs
        self._vehicle_connectors = vehicle_connectors
        self._logical_links = logical_links
        self._ecu_groups = ecu_groups
        self._physical_vehicle_links = physical_vehicle_links
        self._write_diag_comm_ref = write_diag_comm_ref
        self._write_diag_comm_snref = write_diag_comm_snref
        self._write_data_snref = write_data_snref
        self._write_data_snpathref = write_data_snpathref
        self._write_diag_comm = write_diag_comm
        self._write_data = write_data
        self._number = number
        self._publisher = publisher
        self._url = url
        self._position = position

    @classmethod
    def from_dict(cls, dikt) -> 'OdxAny':
        """Returns the dict as a model

        :param dikt: A dict.
        :type: dict
        :return: The OdxAny of this OdxAny.  # noqa: E501
        :rtype: OdxAny
        """
        return util.deserialize_model(dikt, cls)

    @property
    def short_name(self) -> str:
        """Gets the short_name of this OdxAny.


        :return: The short_name of this OdxAny.
        :rtype: str
        """
        return self._short_name

    @short_name.setter
    def short_name(self, short_name: str):
        """Sets the short_name of this OdxAny.


        :param short_name: The short_name of this OdxAny.
        :type short_name: str
        """

        self._short_name = short_name

    @property
    def long_name(self) -> str:
        """Gets the long_name of this OdxAny.


        :return: The long_name of this OdxAny.
        :rtype: str
        """
        return self._long_name

    @long_name.setter
    def long_name(self, long_name: str):
        """Sets the long_name of this OdxAny.


        :param long_name: The long_name of this OdxAny.
        :type long_name: str
        """

        self._long_name = long_name

    @property
    def description(self) -> Description:
        """Gets the description of this OdxAny.


        :return: The description of this OdxAny.
        :rtype: Description
        """
        return self._description

    @description.setter
    def description(self, description: Description):
        """Sets the description of this OdxAny.


        :param description: The description of this OdxAny.
        :type description: Description
        """

        self._description = description

    @property
    def odx_id(self) -> OdxLinkId:
        """Gets the odx_id of this OdxAny.


        :return: The odx_id of this OdxAny.
        :rtype: OdxLinkId
        """
        return self._odx_id

    @odx_id.setter
    def odx_id(self, odx_id: OdxLinkId):
        """Sets the odx_id of this OdxAny.


        :param odx_id: The odx_id of this OdxAny.
        :type odx_id: OdxLinkId
        """

        self._odx_id = odx_id

    @property
    def oid(self) -> str:
        """Gets the oid of this OdxAny.


        :return: The oid of this OdxAny.
        :rtype: str
        """
        return self._oid

    @oid.setter
    def oid(self, oid: str):
        """Sets the oid of this OdxAny.


        :param oid: The oid of this OdxAny.
        :type oid: str
        """

        self._oid = oid

    @property
    def perma_id(self) -> str:
        """Gets the perma_id of this OdxAny.


        :return: The perma_id of this OdxAny.
        :rtype: str
        """
        return self._perma_id

    @perma_id.setter
    def perma_id(self, perma_id: str):
        """Sets the perma_id of this OdxAny.


        :param perma_id: The perma_id of this OdxAny.
        :type perma_id: str
        """

        self._perma_id = perma_id

    @property
    def ephemeral_id(self) -> int:
        """Gets the ephemeral_id of this OdxAny.


        :return: The ephemeral_id of this OdxAny.
        :rtype: int
        """
        return self._ephemeral_id

    @ephemeral_id.setter
    def ephemeral_id(self, ephemeral_id: int):
        """Sets the ephemeral_id of this OdxAny.


        :param ephemeral_id: The ephemeral_id of this OdxAny.
        :type ephemeral_id: int
        """

        self._ephemeral_id = ephemeral_id

    @property
    def class_name(self) -> str:
        """Gets the class_name of this OdxAny.


        :return: The class_name of this OdxAny.
        :rtype: str
        """
        return self._class_name

    @class_name.setter
    def class_name(self, class_name: str):
        """Sets the class_name of this OdxAny.


        :param class_name: The class_name of this OdxAny.
        :type class_name: str
        """

        self._class_name = class_name

    @property
    def filter_start(self) -> int:
        """Gets the filter_start of this OdxAny.


        :return: The filter_start of this OdxAny.
        :rtype: int
        """
        return self._filter_start

    @filter_start.setter
    def filter_start(self, filter_start: int):
        """Sets the filter_start of this OdxAny.


        :param filter_start: The filter_start of this OdxAny.
        :type filter_start: int
        """

        self._filter_start = filter_start

    @property
    def filter_end(self) -> int:
        """Gets the filter_end of this OdxAny.


        :return: The filter_end of this OdxAny.
        :rtype: int
        """
        return self._filter_end

    @filter_end.setter
    def filter_end(self, filter_end: int):
        """Sets the filter_end of this OdxAny.


        :param filter_end: The filter_end of this OdxAny.
        :type filter_end: int
        """

        self._filter_end = filter_end

    @property
    def fillbyte(self) -> int:
        """Gets the fillbyte of this OdxAny.


        :return: The fillbyte of this OdxAny.
        :rtype: int
        """
        return self._fillbyte

    @fillbyte.setter
    def fillbyte(self, fillbyte: int):
        """Sets the fillbyte of this OdxAny.


        :param fillbyte: The fillbyte of this OdxAny.
        :type fillbyte: int
        """

        self._fillbyte = fillbyte

    @property
    def block_size(self) -> int:
        """Gets the block_size of this OdxAny.


        :return: The block_size of this OdxAny.
        :rtype: int
        """
        return self._block_size

    @block_size.setter
    def block_size(self, block_size: int):
        """Sets the block_size of this OdxAny.


        :param block_size: The block_size of this OdxAny.
        :type block_size: int
        """

        self._block_size = block_size

    @property
    def start_address(self) -> int:
        """Gets the start_address of this OdxAny.


        :return: The start_address of this OdxAny.
        :rtype: int
        """
        return self._start_address

    @start_address.setter
    def start_address(self, start_address: int):
        """Sets the start_address of this OdxAny.


        :param start_address: The start_address of this OdxAny.
        :type start_address: int
        """

        self._start_address = start_address

    @property
    def end_address(self) -> int:
        """Gets the end_address of this OdxAny.


        :return: The end_address of this OdxAny.
        :rtype: int
        """
        return self._end_address

    @end_address.setter
    def end_address(self, end_address: int):
        """Sets the end_address of this OdxAny.


        :param end_address: The end_address of this OdxAny.
        :type end_address: int
        """

        self._end_address = end_address

    @property
    def language(self) -> str:
        """Gets the language of this OdxAny.


        :return: The language of this OdxAny.
        :rtype: str
        """
        return self._language

    @language.setter
    def language(self, language: str):
        """Sets the language of this OdxAny.


        :param language: The language of this OdxAny.
        :type language: str
        """

        self._language = language

    @property
    def company_doc_infos(self) -> List[CompanyDocInfo]:
        """Gets the company_doc_infos of this OdxAny.


        :return: The company_doc_infos of this OdxAny.
        :rtype: List[CompanyDocInfo]
        """
        return self._company_doc_infos

    @company_doc_infos.setter
    def company_doc_infos(self, company_doc_infos: List[CompanyDocInfo]):
        """Sets the company_doc_infos of this OdxAny.


        :param company_doc_infos: The company_doc_infos of this OdxAny.
        :type company_doc_infos: List[CompanyDocInfo]
        """

        self._company_doc_infos = company_doc_infos

    @property
    def doc_revisions(self) -> List[DocRevision]:
        """Gets the doc_revisions of this OdxAny.


        :return: The doc_revisions of this OdxAny.
        :rtype: List[DocRevision]
        """
        return self._doc_revisions

    @doc_revisions.setter
    def doc_revisions(self, doc_revisions: List[DocRevision]):
        """Sets the doc_revisions of this OdxAny.


        :param doc_revisions: The doc_revisions of this OdxAny.
        :type doc_revisions: List[DocRevision]
        """

        self._doc_revisions = doc_revisions

    @property
    def enabled_audience_refs(self) -> List[OdxLinkRef]:
        """Gets the enabled_audience_refs of this OdxAny.


        :return: The enabled_audience_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._enabled_audience_refs

    @enabled_audience_refs.setter
    def enabled_audience_refs(self, enabled_audience_refs: List[OdxLinkRef]):
        """Sets the enabled_audience_refs of this OdxAny.


        :param enabled_audience_refs: The enabled_audience_refs of this OdxAny.
        :type enabled_audience_refs: List[OdxLinkRef]
        """

        self._enabled_audience_refs = enabled_audience_refs

    @property
    def disabled_audience_refs(self) -> List[OdxLinkRef]:
        """Gets the disabled_audience_refs of this OdxAny.


        :return: The disabled_audience_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._disabled_audience_refs

    @disabled_audience_refs.setter
    def disabled_audience_refs(self, disabled_audience_refs: List[OdxLinkRef]):
        """Sets the disabled_audience_refs of this OdxAny.


        :param disabled_audience_refs: The disabled_audience_refs of this OdxAny.
        :type disabled_audience_refs: List[OdxLinkRef]
        """

        self._disabled_audience_refs = disabled_audience_refs

    @property
    def is_supplier_raw(self) -> bool:
        """Gets the is_supplier_raw of this OdxAny.


        :return: The is_supplier_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_supplier_raw

    @is_supplier_raw.setter
    def is_supplier_raw(self, is_supplier_raw: bool):
        """Sets the is_supplier_raw of this OdxAny.


        :param is_supplier_raw: The is_supplier_raw of this OdxAny.
        :type is_supplier_raw: bool
        """

        self._is_supplier_raw = is_supplier_raw

    @property
    def is_supplier(self) -> bool:
        """Gets the is_supplier of this OdxAny.


        :return: The is_supplier of this OdxAny.
        :rtype: bool
        """
        return self._is_supplier

    @is_supplier.setter
    def is_supplier(self, is_supplier: bool):
        """Sets the is_supplier of this OdxAny.


        :param is_supplier: The is_supplier of this OdxAny.
        :type is_supplier: bool
        """

        self._is_supplier = is_supplier

    @property
    def is_development_raw(self) -> bool:
        """Gets the is_development_raw of this OdxAny.


        :return: The is_development_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_development_raw

    @is_development_raw.setter
    def is_development_raw(self, is_development_raw: bool):
        """Sets the is_development_raw of this OdxAny.


        :param is_development_raw: The is_development_raw of this OdxAny.
        :type is_development_raw: bool
        """

        self._is_development_raw = is_development_raw

    @property
    def is_development(self) -> bool:
        """Gets the is_development of this OdxAny.


        :return: The is_development of this OdxAny.
        :rtype: bool
        """
        return self._is_development

    @is_development.setter
    def is_development(self, is_development: bool):
        """Sets the is_development of this OdxAny.


        :param is_development: The is_development of this OdxAny.
        :type is_development: bool
        """

        self._is_development = is_development

    @property
    def is_manufacturing_raw(self) -> bool:
        """Gets the is_manufacturing_raw of this OdxAny.


        :return: The is_manufacturing_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_manufacturing_raw

    @is_manufacturing_raw.setter
    def is_manufacturing_raw(self, is_manufacturing_raw: bool):
        """Sets the is_manufacturing_raw of this OdxAny.


        :param is_manufacturing_raw: The is_manufacturing_raw of this OdxAny.
        :type is_manufacturing_raw: bool
        """

        self._is_manufacturing_raw = is_manufacturing_raw

    @property
    def is_manufacturing(self) -> bool:
        """Gets the is_manufacturing of this OdxAny.


        :return: The is_manufacturing of this OdxAny.
        :rtype: bool
        """
        return self._is_manufacturing

    @is_manufacturing.setter
    def is_manufacturing(self, is_manufacturing: bool):
        """Sets the is_manufacturing of this OdxAny.


        :param is_manufacturing: The is_manufacturing of this OdxAny.
        :type is_manufacturing: bool
        """

        self._is_manufacturing = is_manufacturing

    @property
    def is_aftersales_raw(self) -> bool:
        """Gets the is_aftersales_raw of this OdxAny.


        :return: The is_aftersales_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_aftersales_raw

    @is_aftersales_raw.setter
    def is_aftersales_raw(self, is_aftersales_raw: bool):
        """Sets the is_aftersales_raw of this OdxAny.


        :param is_aftersales_raw: The is_aftersales_raw of this OdxAny.
        :type is_aftersales_raw: bool
        """

        self._is_aftersales_raw = is_aftersales_raw

    @property
    def is_aftersales(self) -> bool:
        """Gets the is_aftersales of this OdxAny.


        :return: The is_aftersales of this OdxAny.
        :rtype: bool
        """
        return self._is_aftersales

    @is_aftersales.setter
    def is_aftersales(self, is_aftersales: bool):
        """Sets the is_aftersales of this OdxAny.


        :param is_aftersales: The is_aftersales of this OdxAny.
        :type is_aftersales: bool
        """

        self._is_aftersales = is_aftersales

    @property
    def is_aftermarket_raw(self) -> bool:
        """Gets the is_aftermarket_raw of this OdxAny.


        :return: The is_aftermarket_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_aftermarket_raw

    @is_aftermarket_raw.setter
    def is_aftermarket_raw(self, is_aftermarket_raw: bool):
        """Sets the is_aftermarket_raw of this OdxAny.


        :param is_aftermarket_raw: The is_aftermarket_raw of this OdxAny.
        :type is_aftermarket_raw: bool
        """

        self._is_aftermarket_raw = is_aftermarket_raw

    @property
    def is_aftermarket(self) -> bool:
        """Gets the is_aftermarket of this OdxAny.


        :return: The is_aftermarket of this OdxAny.
        :rtype: bool
        """
        return self._is_aftermarket

    @is_aftermarket.setter
    def is_aftermarket(self, is_aftermarket: bool):
        """Sets the is_aftermarket of this OdxAny.


        :param is_aftermarket: The is_aftermarket of this OdxAny.
        :type is_aftermarket: bool
        """

        self._is_aftermarket = is_aftermarket

    @property
    def enabled_audiences(self) -> List[AdditionalAudience]:
        """Gets the enabled_audiences of this OdxAny.


        :return: The enabled_audiences of this OdxAny.
        :rtype: List[AdditionalAudience]
        """
        return self._enabled_audiences

    @enabled_audiences.setter
    def enabled_audiences(self, enabled_audiences: List[AdditionalAudience]):
        """Sets the enabled_audiences of this OdxAny.


        :param enabled_audiences: The enabled_audiences of this OdxAny.
        :type enabled_audiences: List[AdditionalAudience]
        """

        self._enabled_audiences = enabled_audiences

    @property
    def disabled_audiences(self) -> List[AdditionalAudience]:
        """Gets the disabled_audiences of this OdxAny.


        :return: The disabled_audiences of this OdxAny.
        :rtype: List[AdditionalAudience]
        """
        return self._disabled_audiences

    @disabled_audiences.setter
    def disabled_audiences(self, disabled_audiences: List[AdditionalAudience]):
        """Sets the disabled_audiences of this OdxAny.


        :param disabled_audiences: The disabled_audiences of this OdxAny.
        :type disabled_audiences: List[AdditionalAudience]
        """

        self._disabled_audiences = disabled_audiences

    @property
    def param_class(self) -> str:
        """Gets the param_class of this OdxAny.


        :return: The param_class of this OdxAny.
        :rtype: str
        """
        return self._param_class

    @param_class.setter
    def param_class(self, param_class: str):
        """Sets the param_class of this OdxAny.


        :param param_class: The param_class of this OdxAny.
        :type param_class: str
        """

        self._param_class = param_class

    @property
    def cptype(self) -> StandardizationLevel:
        """Gets the cptype of this OdxAny.


        :return: The cptype of this OdxAny.
        :rtype: StandardizationLevel
        """
        return self._cptype

    @cptype.setter
    def cptype(self, cptype: StandardizationLevel):
        """Sets the cptype of this OdxAny.


        :param cptype: The cptype of this OdxAny.
        :type cptype: StandardizationLevel
        """

        self._cptype = cptype

    @property
    def display_level(self) -> int:
        """Gets the display_level of this OdxAny.


        :return: The display_level of this OdxAny.
        :rtype: int
        """
        return self._display_level

    @display_level.setter
    def display_level(self, display_level: int):
        """Sets the display_level of this OdxAny.


        :param display_level: The display_level of this OdxAny.
        :type display_level: int
        """

        self._display_level = display_level

    @property
    def cpusage(self) -> Usage:
        """Gets the cpusage of this OdxAny.


        :return: The cpusage of this OdxAny.
        :rtype: Usage
        """
        return self._cpusage

    @cpusage.setter
    def cpusage(self, cpusage: Usage):
        """Sets the cpusage of this OdxAny.


        :param cpusage: The cpusage of this OdxAny.
        :type cpusage: Usage
        """

        self._cpusage = cpusage

    @property
    def audience(self) -> Audience:
        """Gets the audience of this OdxAny.


        :return: The audience of this OdxAny.
        :rtype: Audience
        """
        return self._audience

    @audience.setter
    def audience(self, audience: Audience):
        """Sets the audience of this OdxAny.


        :param audience: The audience of this OdxAny.
        :type audience: Audience
        """

        self._audience = audience

    @property
    def function_in_params(self) -> List[FunctionInParam]:
        """Gets the function_in_params of this OdxAny.


        :return: The function_in_params of this OdxAny.
        :rtype: List[FunctionInParam]
        """
        return self._function_in_params

    @function_in_params.setter
    def function_in_params(self, function_in_params: List[FunctionInParam]):
        """Sets the function_in_params of this OdxAny.


        :param function_in_params: The function_in_params of this OdxAny.
        :type function_in_params: List[FunctionInParam]
        """

        self._function_in_params = function_in_params

    @property
    def function_out_params(self) -> List[FunctionOutParam]:
        """Gets the function_out_params of this OdxAny.


        :return: The function_out_params of this OdxAny.
        :rtype: List[FunctionOutParam]
        """
        return self._function_out_params

    @function_out_params.setter
    def function_out_params(self, function_out_params: List[FunctionOutParam]):
        """Sets the function_out_params of this OdxAny.


        :param function_out_params: The function_out_params of this OdxAny.
        :type function_out_params: List[FunctionOutParam]
        """

        self._function_out_params = function_out_params

    @property
    def component_connectors(self) -> List[ComponentConnector]:
        """Gets the component_connectors of this OdxAny.


        :return: The component_connectors of this OdxAny.
        :rtype: List[ComponentConnector]
        """
        return self._component_connectors

    @component_connectors.setter
    def component_connectors(self, component_connectors: List[ComponentConnector]):
        """Sets the component_connectors of this OdxAny.


        :param component_connectors: The component_connectors of this OdxAny.
        :type component_connectors: List[ComponentConnector]
        """

        self._component_connectors = component_connectors

    @property
    def multiple_ecu_job_refs(self) -> List[OdxLinkRef]:
        """Gets the multiple_ecu_job_refs of this OdxAny.


        :return: The multiple_ecu_job_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._multiple_ecu_job_refs

    @multiple_ecu_job_refs.setter
    def multiple_ecu_job_refs(self, multiple_ecu_job_refs: List[OdxLinkRef]):
        """Sets the multiple_ecu_job_refs of this OdxAny.


        :param multiple_ecu_job_refs: The multiple_ecu_job_refs of this OdxAny.
        :type multiple_ecu_job_refs: List[OdxLinkRef]
        """

        self._multiple_ecu_job_refs = multiple_ecu_job_refs

    @property
    def admin_data(self) -> AdminData:
        """Gets the admin_data of this OdxAny.


        :return: The admin_data of this OdxAny.
        :rtype: AdminData
        """
        return self._admin_data

    @admin_data.setter
    def admin_data(self, admin_data: AdminData):
        """Sets the admin_data of this OdxAny.


        :param admin_data: The admin_data of this OdxAny.
        :type admin_data: AdminData
        """

        self._admin_data = admin_data

    @property
    def sdg(self) -> SpecialDataGroup:
        """Gets the sdg of this OdxAny.


        :return: The sdg of this OdxAny.
        :rtype: SpecialDataGroup
        """
        return self._sdg

    @sdg.setter
    def sdg(self, sdg: SpecialDataGroup):
        """Sets the sdg of this OdxAny.


        :param sdg: The sdg of this OdxAny.
        :type sdg: SpecialDataGroup
        """

        self._sdg = sdg

    @property
    def multiple_ecu_jobs(self) -> List[MultipleEcuJob]:
        """Gets the multiple_ecu_jobs of this OdxAny.


        :return: The multiple_ecu_jobs of this OdxAny.
        :rtype: List[MultipleEcuJob]
        """
        return self._multiple_ecu_jobs

    @multiple_ecu_jobs.setter
    def multiple_ecu_jobs(self, multiple_ecu_jobs: List[MultipleEcuJob]):
        """Sets the multiple_ecu_jobs of this OdxAny.


        :param multiple_ecu_jobs: The multiple_ecu_jobs of this OdxAny.
        :type multiple_ecu_jobs: List[MultipleEcuJob]
        """

        self._multiple_ecu_jobs = multiple_ecu_jobs

    @property
    def diag_layer_raw(self) -> DiagLayerRaw:
        """Gets the diag_layer_raw of this OdxAny.


        :return: The diag_layer_raw of this OdxAny.
        :rtype: DiagLayerRaw
        """
        return self._diag_layer_raw

    @diag_layer_raw.setter
    def diag_layer_raw(self, diag_layer_raw: DiagLayerRaw):
        """Sets the diag_layer_raw of this OdxAny.


        :param diag_layer_raw: The diag_layer_raw of this OdxAny.
        :type diag_layer_raw: DiagLayerRaw
        """

        self._diag_layer_raw = diag_layer_raw

    @property
    def matching_base_variant_parameters(self) -> List[MatchingBaseVariantParameter]:
        """Gets the matching_base_variant_parameters of this OdxAny.


        :return: The matching_base_variant_parameters of this OdxAny.
        :rtype: List[MatchingBaseVariantParameter]
        """
        return self._matching_base_variant_parameters

    @matching_base_variant_parameters.setter
    def matching_base_variant_parameters(self, matching_base_variant_parameters: List[MatchingBaseVariantParameter]):
        """Sets the matching_base_variant_parameters of this OdxAny.


        :param matching_base_variant_parameters: The matching_base_variant_parameters of this OdxAny.
        :type matching_base_variant_parameters: List[MatchingBaseVariantParameter]
        """

        self._matching_base_variant_parameters = matching_base_variant_parameters

    @property
    def variant_type(self) -> DiagLayerType:
        """Gets the variant_type of this OdxAny.


        :return: The variant_type of this OdxAny.
        :rtype: DiagLayerType
        """
        return self._variant_type

    @variant_type.setter
    def variant_type(self, variant_type: DiagLayerType):
        """Sets the variant_type of this OdxAny.


        :param variant_type: The variant_type of this OdxAny.
        :type variant_type: DiagLayerType
        """

        self._variant_type = variant_type

    @property
    def company_datas(self) -> List[CompanyData1]:
        """Gets the company_datas of this OdxAny.


        :return: The company_datas of this OdxAny.
        :rtype: List[CompanyData1]
        """
        return self._company_datas

    @company_datas.setter
    def company_datas(self, company_datas: List[CompanyData1]):
        """Sets the company_datas of this OdxAny.


        :param company_datas: The company_datas of this OdxAny.
        :type company_datas: List[CompanyData1]
        """

        self._company_datas = company_datas

    @property
    def functional_classes(self) -> List[FunctionalClass]:
        """Gets the functional_classes of this OdxAny.


        :return: The functional_classes of this OdxAny.
        :rtype: List[FunctionalClass]
        """
        return self._functional_classes

    @functional_classes.setter
    def functional_classes(self, functional_classes: List[FunctionalClass]):
        """Sets the functional_classes of this OdxAny.


        :param functional_classes: The functional_classes of this OdxAny.
        :type functional_classes: List[FunctionalClass]
        """

        self._functional_classes = functional_classes

    @property
    def diag_data_dictionary_spec(self) -> DiagDataDictionarySpec:
        """Gets the diag_data_dictionary_spec of this OdxAny.


        :return: The diag_data_dictionary_spec of this OdxAny.
        :rtype: DiagDataDictionarySpec
        """
        return self._diag_data_dictionary_spec

    @diag_data_dictionary_spec.setter
    def diag_data_dictionary_spec(self, diag_data_dictionary_spec: DiagDataDictionarySpec):
        """Sets the diag_data_dictionary_spec of this OdxAny.


        :param diag_data_dictionary_spec: The diag_data_dictionary_spec of this OdxAny.
        :type diag_data_dictionary_spec: DiagDataDictionarySpec
        """

        self._diag_data_dictionary_spec = diag_data_dictionary_spec

    @property
    def diag_comms_raw(self) -> List[DiagLayerRawDiagCommsRawInner]:
        """Gets the diag_comms_raw of this OdxAny.


        :return: The diag_comms_raw of this OdxAny.
        :rtype: List[DiagLayerRawDiagCommsRawInner]
        """
        return self._diag_comms_raw

    @diag_comms_raw.setter
    def diag_comms_raw(self, diag_comms_raw: List[DiagLayerRawDiagCommsRawInner]):
        """Sets the diag_comms_raw of this OdxAny.


        :param diag_comms_raw: The diag_comms_raw of this OdxAny.
        :type diag_comms_raw: List[DiagLayerRawDiagCommsRawInner]
        """

        self._diag_comms_raw = diag_comms_raw

    @property
    def diag_comms(self) -> List[DiagComm]:
        """Gets the diag_comms of this OdxAny.


        :return: The diag_comms of this OdxAny.
        :rtype: List[DiagComm]
        """
        return self._diag_comms

    @diag_comms.setter
    def diag_comms(self, diag_comms: List[DiagComm]):
        """Sets the diag_comms of this OdxAny.


        :param diag_comms: The diag_comms of this OdxAny.
        :type diag_comms: List[DiagComm]
        """

        self._diag_comms = diag_comms

    @property
    def requests(self) -> List[Request]:
        """Gets the requests of this OdxAny.


        :return: The requests of this OdxAny.
        :rtype: List[Request]
        """
        return self._requests

    @requests.setter
    def requests(self, requests: List[Request]):
        """Sets the requests of this OdxAny.


        :param requests: The requests of this OdxAny.
        :type requests: List[Request]
        """

        self._requests = requests

    @property
    def positive_responses(self) -> List[Response]:
        """Gets the positive_responses of this OdxAny.


        :return: The positive_responses of this OdxAny.
        :rtype: List[Response]
        """
        return self._positive_responses

    @positive_responses.setter
    def positive_responses(self, positive_responses: List[Response]):
        """Sets the positive_responses of this OdxAny.


        :param positive_responses: The positive_responses of this OdxAny.
        :type positive_responses: List[Response]
        """

        self._positive_responses = positive_responses

    @property
    def negative_responses(self) -> List[Response]:
        """Gets the negative_responses of this OdxAny.


        :return: The negative_responses of this OdxAny.
        :rtype: List[Response]
        """
        return self._negative_responses

    @negative_responses.setter
    def negative_responses(self, negative_responses: List[Response]):
        """Sets the negative_responses of this OdxAny.


        :param negative_responses: The negative_responses of this OdxAny.
        :type negative_responses: List[Response]
        """

        self._negative_responses = negative_responses

    @property
    def global_negative_responses(self) -> List[Response]:
        """Gets the global_negative_responses of this OdxAny.


        :return: The global_negative_responses of this OdxAny.
        :rtype: List[Response]
        """
        return self._global_negative_responses

    @global_negative_responses.setter
    def global_negative_responses(self, global_negative_responses: List[Response]):
        """Sets the global_negative_responses of this OdxAny.


        :param global_negative_responses: The global_negative_responses of this OdxAny.
        :type global_negative_responses: List[Response]
        """

        self._global_negative_responses = global_negative_responses

    @property
    def import_refs(self) -> List[OdxLinkRef]:
        """Gets the import_refs of this OdxAny.


        :return: The import_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._import_refs

    @import_refs.setter
    def import_refs(self, import_refs: List[OdxLinkRef]):
        """Sets the import_refs of this OdxAny.


        :param import_refs: The import_refs of this OdxAny.
        :type import_refs: List[OdxLinkRef]
        """

        self._import_refs = import_refs

    @property
    def state_charts(self) -> List[StateChart]:
        """Gets the state_charts of this OdxAny.


        :return: The state_charts of this OdxAny.
        :rtype: List[StateChart]
        """
        return self._state_charts

    @state_charts.setter
    def state_charts(self, state_charts: List[StateChart]):
        """Sets the state_charts of this OdxAny.


        :param state_charts: The state_charts of this OdxAny.
        :type state_charts: List[StateChart]
        """

        self._state_charts = state_charts

    @property
    def additional_audiences(self) -> List[AdditionalAudience]:
        """Gets the additional_audiences of this OdxAny.


        :return: The additional_audiences of this OdxAny.
        :rtype: List[AdditionalAudience]
        """
        return self._additional_audiences

    @additional_audiences.setter
    def additional_audiences(self, additional_audiences: List[AdditionalAudience]):
        """Sets the additional_audiences of this OdxAny.


        :param additional_audiences: The additional_audiences of this OdxAny.
        :type additional_audiences: List[AdditionalAudience]
        """

        self._additional_audiences = additional_audiences

    @property
    def sub_components(self) -> List[SubComponent]:
        """Gets the sub_components of this OdxAny.


        :return: The sub_components of this OdxAny.
        :rtype: List[SubComponent]
        """
        return self._sub_components

    @sub_components.setter
    def sub_components(self, sub_components: List[SubComponent]):
        """Sets the sub_components of this OdxAny.


        :param sub_components: The sub_components of this OdxAny.
        :type sub_components: List[SubComponent]
        """

        self._sub_components = sub_components

    @property
    def libraries(self) -> List[Library]:
        """Gets the libraries of this OdxAny.


        :return: The libraries of this OdxAny.
        :rtype: List[Library]
        """
        return self._libraries

    @libraries.setter
    def libraries(self, libraries: List[Library]):
        """Sets the libraries of this OdxAny.


        :param libraries: The libraries of this OdxAny.
        :type libraries: List[Library]
        """

        self._libraries = libraries

    @property
    def sdgs(self) -> List[SpecialDataGroup]:
        """Gets the sdgs of this OdxAny.


        :return: The sdgs of this OdxAny.
        :rtype: List[SpecialDataGroup]
        """
        return self._sdgs

    @sdgs.setter
    def sdgs(self, sdgs: List[SpecialDataGroup]):
        """Sets the sdgs of this OdxAny.


        :param sdgs: The sdgs of this OdxAny.
        :type sdgs: List[SpecialDataGroup]
        """

        self._sdgs = sdgs

    @property
    def comparam_refs(self) -> List[ComparamInstance]:
        """Gets the comparam_refs of this OdxAny.


        :return: The comparam_refs of this OdxAny.
        :rtype: List[ComparamInstance]
        """
        return self._comparam_refs

    @comparam_refs.setter
    def comparam_refs(self, comparam_refs: List[ComparamInstance]):
        """Sets the comparam_refs of this OdxAny.


        :param comparam_refs: The comparam_refs of this OdxAny.
        :type comparam_refs: List[ComparamInstance]
        """

        self._comparam_refs = comparam_refs

    @property
    def diag_variables_raw(self) -> List[BaseVariantRawDiagVariablesRawInner]:
        """Gets the diag_variables_raw of this OdxAny.


        :return: The diag_variables_raw of this OdxAny.
        :rtype: List[BaseVariantRawDiagVariablesRawInner]
        """
        return self._diag_variables_raw

    @diag_variables_raw.setter
    def diag_variables_raw(self, diag_variables_raw: List[BaseVariantRawDiagVariablesRawInner]):
        """Sets the diag_variables_raw of this OdxAny.


        :param diag_variables_raw: The diag_variables_raw of this OdxAny.
        :type diag_variables_raw: List[BaseVariantRawDiagVariablesRawInner]
        """

        self._diag_variables_raw = diag_variables_raw

    @property
    def diag_variables(self) -> List[DiagVariable]:
        """Gets the diag_variables of this OdxAny.


        :return: The diag_variables of this OdxAny.
        :rtype: List[DiagVariable]
        """
        return self._diag_variables

    @diag_variables.setter
    def diag_variables(self, diag_variables: List[DiagVariable]):
        """Sets the diag_variables of this OdxAny.


        :param diag_variables: The diag_variables of this OdxAny.
        :type diag_variables: List[DiagVariable]
        """

        self._diag_variables = diag_variables

    @property
    def variable_groups(self) -> List[VariableGroup]:
        """Gets the variable_groups of this OdxAny.


        :return: The variable_groups of this OdxAny.
        :rtype: List[VariableGroup]
        """
        return self._variable_groups

    @variable_groups.setter
    def variable_groups(self, variable_groups: List[VariableGroup]):
        """Sets the variable_groups of this OdxAny.


        :param variable_groups: The variable_groups of this OdxAny.
        :type variable_groups: List[VariableGroup]
        """

        self._variable_groups = variable_groups

    @property
    def dyn_defined_spec(self) -> DynDefinedSpec:
        """Gets the dyn_defined_spec of this OdxAny.


        :return: The dyn_defined_spec of this OdxAny.
        :rtype: DynDefinedSpec
        """
        return self._dyn_defined_spec

    @dyn_defined_spec.setter
    def dyn_defined_spec(self, dyn_defined_spec: DynDefinedSpec):
        """Sets the dyn_defined_spec of this OdxAny.


        :param dyn_defined_spec: The dyn_defined_spec of this OdxAny.
        :type dyn_defined_spec: DynDefinedSpec
        """

        self._dyn_defined_spec = dyn_defined_spec

    @property
    def base_variant_pattern(self) -> BaseVariantPattern:
        """Gets the base_variant_pattern of this OdxAny.


        :return: The base_variant_pattern of this OdxAny.
        :rtype: BaseVariantPattern
        """
        return self._base_variant_pattern

    @base_variant_pattern.setter
    def base_variant_pattern(self, base_variant_pattern: BaseVariantPattern):
        """Sets the base_variant_pattern of this OdxAny.


        :param base_variant_pattern: The base_variant_pattern of this OdxAny.
        :type base_variant_pattern: BaseVariantPattern
        """

        self._base_variant_pattern = base_variant_pattern

    @property
    def parent_refs(self) -> List[ParentRef]:
        """Gets the parent_refs of this OdxAny.


        :return: The parent_refs of this OdxAny.
        :rtype: List[ParentRef]
        """
        return self._parent_refs

    @parent_refs.setter
    def parent_refs(self, parent_refs: List[ParentRef]):
        """Sets the parent_refs of this OdxAny.


        :param parent_refs: The parent_refs of this OdxAny.
        :type parent_refs: List[ParentRef]
        """

        self._parent_refs = parent_refs

    @property
    def byte_size(self) -> int:
        """Gets the byte_size of this OdxAny.


        :return: The byte_size of this OdxAny.
        :rtype: int
        """
        return self._byte_size

    @byte_size.setter
    def byte_size(self, byte_size: int):
        """Sets the byte_size of this OdxAny.


        :param byte_size: The byte_size of this OdxAny.
        :type byte_size: int
        """

        self._byte_size = byte_size

    @property
    def parameters(self) -> List[Parameter]:
        """Gets the parameters of this OdxAny.


        :return: The parameters of this OdxAny.
        :rtype: List[Parameter]
        """
        return self._parameters

    @parameters.setter
    def parameters(self, parameters: List[Parameter]):
        """Sets the parameters of this OdxAny.


        :param parameters: The parameters of this OdxAny.
        :type parameters: List[Parameter]
        """

        self._parameters = parameters

    @property
    def source_start_address(self) -> int:
        """Gets the source_start_address of this OdxAny.


        :return: The source_start_address of this OdxAny.
        :rtype: int
        """
        return self._source_start_address

    @source_start_address.setter
    def source_start_address(self, source_start_address: int):
        """Sets the source_start_address of this OdxAny.


        :param source_start_address: The source_start_address of this OdxAny.
        :type source_start_address: int
        """

        self._source_start_address = source_start_address

    @property
    def compressed_size(self) -> int:
        """Gets the compressed_size of this OdxAny.


        :return: The compressed_size of this OdxAny.
        :rtype: int
        """
        return self._compressed_size

    @compressed_size.setter
    def compressed_size(self, compressed_size: int):
        """Sets the compressed_size of this OdxAny.


        :param compressed_size: The compressed_size of this OdxAny.
        :type compressed_size: int
        """

        self._compressed_size = compressed_size

    @property
    def checksum_alg(self) -> str:
        """Gets the checksum_alg of this OdxAny.


        :return: The checksum_alg of this OdxAny.
        :rtype: str
        """
        return self._checksum_alg

    @checksum_alg.setter
    def checksum_alg(self, checksum_alg: str):
        """Sets the checksum_alg of this OdxAny.


        :param checksum_alg: The checksum_alg of this OdxAny.
        :type checksum_alg: str
        """

        self._checksum_alg = checksum_alg

    @property
    def source_end_address(self) -> int:
        """Gets the source_end_address of this OdxAny.


        :return: The source_end_address of this OdxAny.
        :rtype: int
        """
        return self._source_end_address

    @source_end_address.setter
    def source_end_address(self, source_end_address: int):
        """Sets the source_end_address of this OdxAny.


        :param source_end_address: The source_end_address of this OdxAny.
        :type source_end_address: int
        """

        self._source_end_address = source_end_address

    @property
    def uncompressed_size(self) -> int:
        """Gets the uncompressed_size of this OdxAny.


        :return: The uncompressed_size of this OdxAny.
        :rtype: int
        """
        return self._uncompressed_size

    @uncompressed_size.setter
    def uncompressed_size(self, uncompressed_size: int):
        """Sets the uncompressed_size of this OdxAny.


        :param uncompressed_size: The uncompressed_size of this OdxAny.
        :type uncompressed_size: int
        """

        self._uncompressed_size = uncompressed_size

    @property
    def checksum_result(self) -> ValidityFor:
        """Gets the checksum_result of this OdxAny.


        :return: The checksum_result of this OdxAny.
        :rtype: ValidityFor
        """
        return self._checksum_result

    @checksum_result.setter
    def checksum_result(self, checksum_result: ValidityFor):
        """Sets the checksum_result of this OdxAny.


        :param checksum_result: The checksum_result of this OdxAny.
        :type checksum_result: ValidityFor
        """

        self._checksum_result = checksum_result

    @property
    def semantic(self) -> str:
        """Gets the semantic of this OdxAny.


        :return: The semantic of this OdxAny.
        :rtype: str
        """
        return self._semantic

    @semantic.setter
    def semantic(self, semantic: str):
        """Sets the semantic of this OdxAny.


        :param semantic: The semantic of this OdxAny.
        :type semantic: str
        """

        self._semantic = semantic

    @property
    def byte_position(self) -> int:
        """Gets the byte_position of this OdxAny.


        :return: The byte_position of this OdxAny.
        :rtype: int
        """
        return self._byte_position

    @byte_position.setter
    def byte_position(self, byte_position: int):
        """Sets the byte_position of this OdxAny.


        :param byte_position: The byte_position of this OdxAny.
        :type byte_position: int
        """

        self._byte_position = byte_position

    @property
    def bit_position(self) -> int:
        """Gets the bit_position of this OdxAny.


        :return: The bit_position of this OdxAny.
        :rtype: int
        """
        return self._bit_position

    @bit_position.setter
    def bit_position(self, bit_position: int):
        """Sets the bit_position of this OdxAny.


        :param bit_position: The bit_position of this OdxAny.
        :type bit_position: int
        """

        self._bit_position = bit_position

    @property
    def coded_value_raw(self) -> str:
        """Gets the coded_value_raw of this OdxAny.


        :return: The coded_value_raw of this OdxAny.
        :rtype: str
        """
        return self._coded_value_raw

    @coded_value_raw.setter
    def coded_value_raw(self, coded_value_raw: str):
        """Sets the coded_value_raw of this OdxAny.


        :param coded_value_raw: The coded_value_raw of this OdxAny.
        :type coded_value_raw: str
        """

        self._coded_value_raw = coded_value_raw

    @property
    def coded_value(self) -> LimitValue:
        """Gets the coded_value of this OdxAny.


        :return: The coded_value of this OdxAny.
        :rtype: LimitValue
        """
        return self._coded_value

    @coded_value.setter
    def coded_value(self, coded_value: LimitValue):
        """Sets the coded_value of this OdxAny.


        :param coded_value: The coded_value of this OdxAny.
        :type coded_value: LimitValue
        """

        self._coded_value = coded_value

    @property
    def diag_coded_type(self) -> DiagCodedType:
        """Gets the diag_coded_type of this OdxAny.


        :return: The diag_coded_type of this OdxAny.
        :rtype: DiagCodedType
        """
        return self._diag_coded_type

    @diag_coded_type.setter
    def diag_coded_type(self, diag_coded_type: DiagCodedType):
        """Sets the diag_coded_type of this OdxAny.


        :param diag_coded_type: The diag_coded_type of this OdxAny.
        :type diag_coded_type: DiagCodedType
        """

        self._diag_coded_type = diag_coded_type

    @property
    def relation_type(self) -> str:
        """Gets the relation_type of this OdxAny.


        :return: The relation_type of this OdxAny.
        :rtype: str
        """
        return self._relation_type

    @relation_type.setter
    def relation_type(self, relation_type: str):
        """Sets the relation_type of this OdxAny.


        :param relation_type: The relation_type of this OdxAny.
        :type relation_type: str
        """

        self._relation_type = relation_type

    @property
    def diag_comm_ref(self) -> OdxLinkRef:
        """Gets the diag_comm_ref of this OdxAny.


        :return: The diag_comm_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._diag_comm_ref

    @diag_comm_ref.setter
    def diag_comm_ref(self, diag_comm_ref: OdxLinkRef):
        """Sets the diag_comm_ref of this OdxAny.


        :param diag_comm_ref: The diag_comm_ref of this OdxAny.
        :type diag_comm_ref: OdxLinkRef
        """

        self._diag_comm_ref = diag_comm_ref

    @property
    def diag_comm_snref(self) -> str:
        """Gets the diag_comm_snref of this OdxAny.


        :return: The diag_comm_snref of this OdxAny.
        :rtype: str
        """
        return self._diag_comm_snref

    @diag_comm_snref.setter
    def diag_comm_snref(self, diag_comm_snref: str):
        """Sets the diag_comm_snref of this OdxAny.


        :param diag_comm_snref: The diag_comm_snref of this OdxAny.
        :type diag_comm_snref: str
        """

        self._diag_comm_snref = diag_comm_snref

    @property
    def in_param_if_snref(self) -> str:
        """Gets the in_param_if_snref of this OdxAny.


        :return: The in_param_if_snref of this OdxAny.
        :rtype: str
        """
        return self._in_param_if_snref

    @in_param_if_snref.setter
    def in_param_if_snref(self, in_param_if_snref: str):
        """Sets the in_param_if_snref of this OdxAny.


        :param in_param_if_snref: The in_param_if_snref of this OdxAny.
        :type in_param_if_snref: str
        """

        self._in_param_if_snref = in_param_if_snref

    @property
    def out_param_if_snref(self) -> str:
        """Gets the out_param_if_snref of this OdxAny.


        :return: The out_param_if_snref of this OdxAny.
        :rtype: str
        """
        return self._out_param_if_snref

    @out_param_if_snref.setter
    def out_param_if_snref(self, out_param_if_snref: str):
        """Sets the out_param_if_snref of this OdxAny.


        :param out_param_if_snref: The out_param_if_snref of this OdxAny.
        :type out_param_if_snref: str
        """

        self._out_param_if_snref = out_param_if_snref

    @property
    def value_type_raw(self) -> CommRelationValueType:
        """Gets the value_type_raw of this OdxAny.


        :return: The value_type_raw of this OdxAny.
        :rtype: CommRelationValueType
        """
        return self._value_type_raw

    @value_type_raw.setter
    def value_type_raw(self, value_type_raw: CommRelationValueType):
        """Sets the value_type_raw of this OdxAny.


        :param value_type_raw: The value_type_raw of this OdxAny.
        :type value_type_raw: CommRelationValueType
        """

        self._value_type_raw = value_type_raw

    @property
    def value_type(self) -> SessionSubElemType:
        """Gets the value_type of this OdxAny.


        :return: The value_type of this OdxAny.
        :rtype: SessionSubElemType
        """
        return self._value_type

    @value_type.setter
    def value_type(self, value_type: SessionSubElemType):
        """Sets the value_type of this OdxAny.


        :param value_type: The value_type of this OdxAny.
        :type value_type: SessionSubElemType
        """

        self._value_type = value_type

    @property
    def diag_comm(self) -> DiagCommResolved:
        """Gets the diag_comm of this OdxAny.


        :return: The diag_comm of this OdxAny.
        :rtype: DiagCommResolved
        """
        return self._diag_comm

    @diag_comm.setter
    def diag_comm(self, diag_comm: DiagCommResolved):
        """Sets the diag_comm of this OdxAny.


        :param diag_comm: The diag_comm of this OdxAny.
        :type diag_comm: DiagCommResolved
        """

        self._diag_comm = diag_comm

    @property
    def in_param_if(self) -> Parameter:
        """Gets the in_param_if of this OdxAny.


        :return: The in_param_if of this OdxAny.
        :rtype: Parameter
        """
        return self._in_param_if

    @in_param_if.setter
    def in_param_if(self, in_param_if: Parameter):
        """Sets the in_param_if of this OdxAny.


        :param in_param_if: The in_param_if of this OdxAny.
        :type in_param_if: Parameter
        """

        self._in_param_if = in_param_if

    @property
    def out_param_if(self) -> Parameter:
        """Gets the out_param_if of this OdxAny.


        :return: The out_param_if of this OdxAny.
        :rtype: Parameter
        """
        return self._out_param_if

    @out_param_if.setter
    def out_param_if(self, out_param_if: Parameter):
        """Sets the out_param_if of this OdxAny.


        :param out_param_if: The out_param_if of this OdxAny.
        :type out_param_if: Parameter
        """

        self._out_param_if = out_param_if

    @property
    def roles(self) -> List[str]:
        """Gets the roles of this OdxAny.


        :return: The roles of this OdxAny.
        :rtype: List[str]
        """
        return self._roles

    @roles.setter
    def roles(self, roles: List[str]):
        """Sets the roles of this OdxAny.


        :param roles: The roles of this OdxAny.
        :type roles: List[str]
        """

        self._roles = roles

    @property
    def team_members(self) -> List[TeamMember]:
        """Gets the team_members of this OdxAny.


        :return: The team_members of this OdxAny.
        :rtype: List[TeamMember]
        """
        return self._team_members

    @team_members.setter
    def team_members(self, team_members: List[TeamMember]):
        """Sets the team_members of this OdxAny.


        :param team_members: The team_members of this OdxAny.
        :type team_members: List[TeamMember]
        """

        self._team_members = team_members

    @property
    def company_specific_info(self) -> CompanySpecificInfo:
        """Gets the company_specific_info of this OdxAny.


        :return: The company_specific_info of this OdxAny.
        :rtype: CompanySpecificInfo
        """
        return self._company_specific_info

    @company_specific_info.setter
    def company_specific_info(self, company_specific_info: CompanySpecificInfo):
        """Sets the company_specific_info of this OdxAny.


        :param company_specific_info: The company_specific_info of this OdxAny.
        :type company_specific_info: CompanySpecificInfo
        """

        self._company_specific_info = company_specific_info

    @property
    def company_data_ref(self) -> OdxLinkRef:
        """Gets the company_data_ref of this OdxAny.


        :return: The company_data_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._company_data_ref

    @company_data_ref.setter
    def company_data_ref(self, company_data_ref: OdxLinkRef):
        """Sets the company_data_ref of this OdxAny.


        :param company_data_ref: The company_data_ref of this OdxAny.
        :type company_data_ref: OdxLinkRef
        """

        self._company_data_ref = company_data_ref

    @property
    def team_member_ref(self) -> OdxLinkRef:
        """Gets the team_member_ref of this OdxAny.


        :return: The team_member_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._team_member_ref

    @team_member_ref.setter
    def team_member_ref(self, team_member_ref: OdxLinkRef):
        """Sets the team_member_ref of this OdxAny.


        :param team_member_ref: The team_member_ref of this OdxAny.
        :type team_member_ref: OdxLinkRef
        """

        self._team_member_ref = team_member_ref

    @property
    def doc_label(self) -> str:
        """Gets the doc_label of this OdxAny.


        :return: The doc_label of this OdxAny.
        :rtype: str
        """
        return self._doc_label

    @doc_label.setter
    def doc_label(self, doc_label: str):
        """Sets the doc_label of this OdxAny.


        :param doc_label: The doc_label of this OdxAny.
        :type doc_label: str
        """

        self._doc_label = doc_label

    @property
    def company_data(self) -> CompanyData1:
        """Gets the company_data of this OdxAny.


        :return: The company_data of this OdxAny.
        :rtype: CompanyData1
        """
        return self._company_data

    @company_data.setter
    def company_data(self, company_data: CompanyData1):
        """Sets the company_data of this OdxAny.


        :param company_data: The company_data of this OdxAny.
        :type company_data: CompanyData1
        """

        self._company_data = company_data

    @property
    def team_member(self) -> TeamMember:
        """Gets the team_member of this OdxAny.


        :return: The team_member of this OdxAny.
        :rtype: TeamMember
        """
        return self._team_member

    @team_member.setter
    def team_member(self, team_member: TeamMember):
        """Sets the team_member of this OdxAny.


        :param team_member: The team_member of this OdxAny.
        :type team_member: TeamMember
        """

        self._team_member = team_member

    @property
    def revision_label(self) -> str:
        """Gets the revision_label of this OdxAny.


        :return: The revision_label of this OdxAny.
        :rtype: str
        """
        return self._revision_label

    @revision_label.setter
    def revision_label(self, revision_label: str):
        """Sets the revision_label of this OdxAny.


        :param revision_label: The revision_label of this OdxAny.
        :type revision_label: str
        """

        self._revision_label = revision_label

    @property
    def state(self) -> str:
        """Gets the state of this OdxAny.


        :return: The state of this OdxAny.
        :rtype: str
        """
        return self._state

    @state.setter
    def state(self, state: str):
        """Sets the state of this OdxAny.


        :param state: The state of this OdxAny.
        :type state: str
        """

        self._state = state

    @property
    def related_docs(self) -> List[RelatedDoc]:
        """Gets the related_docs of this OdxAny.


        :return: The related_docs of this OdxAny.
        :rtype: List[RelatedDoc]
        """
        return self._related_docs

    @related_docs.setter
    def related_docs(self, related_docs: List[RelatedDoc]):
        """Sets the related_docs of this OdxAny.


        :param related_docs: The related_docs of this OdxAny.
        :type related_docs: List[RelatedDoc]
        """

        self._related_docs = related_docs

    @property
    def physical_default_value_raw(self) -> str:
        """Gets the physical_default_value_raw of this OdxAny.


        :return: The physical_default_value_raw of this OdxAny.
        :rtype: str
        """
        return self._physical_default_value_raw

    @physical_default_value_raw.setter
    def physical_default_value_raw(self, physical_default_value_raw: str):
        """Sets the physical_default_value_raw of this OdxAny.


        :param physical_default_value_raw: The physical_default_value_raw of this OdxAny.
        :type physical_default_value_raw: str
        """

        self._physical_default_value_raw = physical_default_value_raw

    @property
    def physical_default_value(self) -> LimitValue:
        """Gets the physical_default_value of this OdxAny.


        :return: The physical_default_value of this OdxAny.
        :rtype: LimitValue
        """
        return self._physical_default_value

    @physical_default_value.setter
    def physical_default_value(self, physical_default_value: LimitValue):
        """Sets the physical_default_value of this OdxAny.


        :param physical_default_value: The physical_default_value of this OdxAny.
        :type physical_default_value: LimitValue
        """

        self._physical_default_value = physical_default_value

    @property
    def dop_ref(self) -> OdxLinkRef:
        """Gets the dop_ref of this OdxAny.


        :return: The dop_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._dop_ref

    @dop_ref.setter
    def dop_ref(self, dop_ref: OdxLinkRef):
        """Sets the dop_ref of this OdxAny.


        :param dop_ref: The dop_ref of this OdxAny.
        :type dop_ref: OdxLinkRef
        """

        self._dop_ref = dop_ref

    @property
    def value(self) -> LimitValue:
        """Gets the value of this OdxAny.


        :return: The value of this OdxAny.
        :rtype: LimitValue
        """
        return self._value

    @value.setter
    def value(self, value: LimitValue):
        """Sets the value of this OdxAny.


        :param value: The value of this OdxAny.
        :type value: LimitValue
        """

        self._value = value

    @property
    def protocol_snref(self) -> str:
        """Gets the protocol_snref of this OdxAny.


        :return: The protocol_snref of this OdxAny.
        :rtype: str
        """
        return self._protocol_snref

    @protocol_snref.setter
    def protocol_snref(self, protocol_snref: str):
        """Sets the protocol_snref of this OdxAny.


        :param protocol_snref: The protocol_snref of this OdxAny.
        :type protocol_snref: str
        """

        self._protocol_snref = protocol_snref

    @property
    def prot_stack_snref(self) -> str:
        """Gets the prot_stack_snref of this OdxAny.


        :return: The prot_stack_snref of this OdxAny.
        :rtype: str
        """
        return self._prot_stack_snref

    @prot_stack_snref.setter
    def prot_stack_snref(self, prot_stack_snref: str):
        """Sets the prot_stack_snref of this OdxAny.


        :param prot_stack_snref: The prot_stack_snref of this OdxAny.
        :type prot_stack_snref: str
        """

        self._prot_stack_snref = prot_stack_snref

    @property
    def spec_ref(self) -> OdxLinkRef:
        """Gets the spec_ref of this OdxAny.


        :return: The spec_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._spec_ref

    @spec_ref.setter
    def spec_ref(self, spec_ref: OdxLinkRef):
        """Sets the spec_ref of this OdxAny.


        :param spec_ref: The spec_ref of this OdxAny.
        :type spec_ref: OdxLinkRef
        """

        self._spec_ref = spec_ref

    @property
    def spec(self) -> BaseComparam:
        """Gets the spec of this OdxAny.


        :return: The spec of this OdxAny.
        :rtype: BaseComparam
        """
        return self._spec

    @spec.setter
    def spec(self, spec: BaseComparam):
        """Sets the spec of this OdxAny.


        :param spec: The spec of this OdxAny.
        :type spec: BaseComparam
        """

        self._spec = spec

    @property
    def dop(self) -> DopBase:
        """Gets the dop of this OdxAny.


        :return: The dop of this OdxAny.
        :rtype: DopBase
        """
        return self._dop

    @dop.setter
    def dop(self, dop: DopBase):
        """Sets the dop of this OdxAny.


        :param dop: The dop of this OdxAny.
        :type dop: DopBase
        """

        self._dop = dop

    @property
    def prot_stacks(self) -> List[ProtStack]:
        """Gets the prot_stacks of this OdxAny.


        :return: The prot_stacks of this OdxAny.
        :rtype: List[ProtStack]
        """
        return self._prot_stacks

    @prot_stacks.setter
    def prot_stacks(self, prot_stacks: List[ProtStack]):
        """Sets the prot_stacks of this OdxAny.


        :param prot_stacks: The prot_stacks of this OdxAny.
        :type prot_stacks: List[ProtStack]
        """

        self._prot_stacks = prot_stacks

    @property
    def comparams(self) -> List[ComparamInstance]:
        """Gets the comparams of this OdxAny.


        :return: The comparams of this OdxAny.
        :rtype: List[ComparamInstance]
        """
        return self._comparams

    @comparams.setter
    def comparams(self, comparams: List[ComparamInstance]):
        """Sets the comparams of this OdxAny.


        :param comparams: The comparams of this OdxAny.
        :type comparams: List[ComparamInstance]
        """

        self._comparams = comparams

    @property
    def complex_comparams(self) -> List[ComplexComparam]:
        """Gets the complex_comparams of this OdxAny.


        :return: The complex_comparams of this OdxAny.
        :rtype: List[ComplexComparam]
        """
        return self._complex_comparams

    @complex_comparams.setter
    def complex_comparams(self, complex_comparams: List[ComplexComparam]):
        """Sets the complex_comparams of this OdxAny.


        :param complex_comparams: The complex_comparams of this OdxAny.
        :type complex_comparams: List[ComplexComparam]
        """

        self._complex_comparams = complex_comparams

    @property
    def data_object_props(self) -> List[DataObjectProperty]:
        """Gets the data_object_props of this OdxAny.


        :return: The data_object_props of this OdxAny.
        :rtype: List[DataObjectProperty]
        """
        return self._data_object_props

    @data_object_props.setter
    def data_object_props(self, data_object_props: List[DataObjectProperty]):
        """Sets the data_object_props of this OdxAny.


        :param data_object_props: The data_object_props of this OdxAny.
        :type data_object_props: List[DataObjectProperty]
        """

        self._data_object_props = data_object_props

    @property
    def unit_spec(self) -> UnitSpec:
        """Gets the unit_spec of this OdxAny.


        :return: The unit_spec of this OdxAny.
        :rtype: UnitSpec
        """
        return self._unit_spec

    @unit_spec.setter
    def unit_spec(self, unit_spec: UnitSpec):
        """Sets the unit_spec of this OdxAny.


        :param unit_spec: The unit_spec of this OdxAny.
        :type unit_spec: UnitSpec
        """

        self._unit_spec = unit_spec

    @property
    def category(self) -> UnitGroupCategory:
        """Gets the category of this OdxAny.


        :return: The category of this OdxAny.
        :rtype: UnitGroupCategory
        """
        return self._category

    @category.setter
    def category(self, category: UnitGroupCategory):
        """Sets the category of this OdxAny.


        :param category: The category of this OdxAny.
        :type category: UnitGroupCategory
        """

        self._category = category

    @property
    def subparams(self) -> List[BaseComparam]:
        """Gets the subparams of this OdxAny.


        :return: The subparams of this OdxAny.
        :rtype: List[BaseComparam]
        """
        return self._subparams

    @subparams.setter
    def subparams(self, subparams: List[BaseComparam]):
        """Sets the subparams of this OdxAny.


        :param subparams: The subparams of this OdxAny.
        :type subparams: List[BaseComparam]
        """

        self._subparams = subparams

    @property
    def allow_multiple_values_raw(self) -> bool:
        """Gets the allow_multiple_values_raw of this OdxAny.


        :return: The allow_multiple_values_raw of this OdxAny.
        :rtype: bool
        """
        return self._allow_multiple_values_raw

    @allow_multiple_values_raw.setter
    def allow_multiple_values_raw(self, allow_multiple_values_raw: bool):
        """Sets the allow_multiple_values_raw of this OdxAny.


        :param allow_multiple_values_raw: The allow_multiple_values_raw of this OdxAny.
        :type allow_multiple_values_raw: bool
        """

        self._allow_multiple_values_raw = allow_multiple_values_raw

    @property
    def allow_multiple_values(self) -> bool:
        """Gets the allow_multiple_values of this OdxAny.


        :return: The allow_multiple_values of this OdxAny.
        :rtype: bool
        """
        return self._allow_multiple_values

    @allow_multiple_values.setter
    def allow_multiple_values(self, allow_multiple_values: bool):
        """Sets the allow_multiple_values of this OdxAny.


        :param allow_multiple_values: The allow_multiple_values of this OdxAny.
        :type allow_multiple_values: bool
        """

        self._allow_multiple_values = allow_multiple_values

    @property
    def ecu_variant_refs(self) -> List[OdxLinkRef]:
        """Gets the ecu_variant_refs of this OdxAny.


        :return: The ecu_variant_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._ecu_variant_refs

    @ecu_variant_refs.setter
    def ecu_variant_refs(self, ecu_variant_refs: List[OdxLinkRef]):
        """Sets the ecu_variant_refs of this OdxAny.


        :param ecu_variant_refs: The ecu_variant_refs of this OdxAny.
        :type ecu_variant_refs: List[OdxLinkRef]
        """

        self._ecu_variant_refs = ecu_variant_refs

    @property
    def base_variant_ref(self) -> OdxLinkRef:
        """Gets the base_variant_ref of this OdxAny.


        :return: The base_variant_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._base_variant_ref

    @base_variant_ref.setter
    def base_variant_ref(self, base_variant_ref: OdxLinkRef):
        """Sets the base_variant_ref of this OdxAny.


        :param base_variant_ref: The base_variant_ref of this OdxAny.
        :type base_variant_ref: OdxLinkRef
        """

        self._base_variant_ref = base_variant_ref

    @property
    def diag_object_connector(self) -> DiagObjectConnector:
        """Gets the diag_object_connector of this OdxAny.


        :return: The diag_object_connector of this OdxAny.
        :rtype: DiagObjectConnector
        """
        return self._diag_object_connector

    @diag_object_connector.setter
    def diag_object_connector(self, diag_object_connector: DiagObjectConnector):
        """Sets the diag_object_connector of this OdxAny.


        :param diag_object_connector: The diag_object_connector of this OdxAny.
        :type diag_object_connector: DiagObjectConnector
        """

        self._diag_object_connector = diag_object_connector

    @property
    def diag_object_connector_ref(self) -> OdxLinkRef:
        """Gets the diag_object_connector_ref of this OdxAny.


        :return: The diag_object_connector_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._diag_object_connector_ref

    @diag_object_connector_ref.setter
    def diag_object_connector_ref(self, diag_object_connector_ref: OdxLinkRef):
        """Sets the diag_object_connector_ref of this OdxAny.


        :param diag_object_connector_ref: The diag_object_connector_ref of this OdxAny.
        :type diag_object_connector_ref: OdxLinkRef
        """

        self._diag_object_connector_ref = diag_object_connector_ref

    @property
    def ecu_variants(self) -> List[EcuVariant]:
        """Gets the ecu_variants of this OdxAny.


        :return: The ecu_variants of this OdxAny.
        :rtype: List[EcuVariant]
        """
        return self._ecu_variants

    @ecu_variants.setter
    def ecu_variants(self, ecu_variants: List[EcuVariant]):
        """Sets the ecu_variants of this OdxAny.


        :param ecu_variants: The ecu_variants of this OdxAny.
        :type ecu_variants: List[EcuVariant]
        """

        self._ecu_variants = ecu_variants

    @property
    def base_variant(self) -> BaseVariant:
        """Gets the base_variant of this OdxAny.


        :return: The base_variant of this OdxAny.
        :rtype: BaseVariant
        """
        return self._base_variant

    @base_variant.setter
    def base_variant(self, base_variant: BaseVariant):
        """Sets the base_variant of this OdxAny.


        :param base_variant: The base_variant of this OdxAny.
        :type base_variant: BaseVariant
        """

        self._base_variant = base_variant

    @property
    def compu_internal_to_phys(self) -> CompuInternalToPhys:
        """Gets the compu_internal_to_phys of this OdxAny.


        :return: The compu_internal_to_phys of this OdxAny.
        :rtype: CompuInternalToPhys
        """
        return self._compu_internal_to_phys

    @compu_internal_to_phys.setter
    def compu_internal_to_phys(self, compu_internal_to_phys: CompuInternalToPhys):
        """Sets the compu_internal_to_phys of this OdxAny.


        :param compu_internal_to_phys: The compu_internal_to_phys of this OdxAny.
        :type compu_internal_to_phys: CompuInternalToPhys
        """

        self._compu_internal_to_phys = compu_internal_to_phys

    @property
    def compu_phys_to_internal(self) -> CompuPhysToInternal:
        """Gets the compu_phys_to_internal of this OdxAny.


        :return: The compu_phys_to_internal of this OdxAny.
        :rtype: CompuPhysToInternal
        """
        return self._compu_phys_to_internal

    @compu_phys_to_internal.setter
    def compu_phys_to_internal(self, compu_phys_to_internal: CompuPhysToInternal):
        """Sets the compu_phys_to_internal of this OdxAny.


        :param compu_phys_to_internal: The compu_phys_to_internal of this OdxAny.
        :type compu_phys_to_internal: CompuPhysToInternal
        """

        self._compu_phys_to_internal = compu_phys_to_internal

    @property
    def physical_type(self) -> DataType:
        """Gets the physical_type of this OdxAny.


        :return: The physical_type of this OdxAny.
        :rtype: DataType
        """
        return self._physical_type

    @physical_type.setter
    def physical_type(self, physical_type: DataType):
        """Sets the physical_type of this OdxAny.


        :param physical_type: The physical_type of this OdxAny.
        :type physical_type: DataType
        """

        self._physical_type = physical_type

    @property
    def internal_type(self) -> DataType:
        """Gets the internal_type of this OdxAny.


        :return: The internal_type of this OdxAny.
        :rtype: DataType
        """
        return self._internal_type

    @internal_type.setter
    def internal_type(self, internal_type: DataType):
        """Sets the internal_type of this OdxAny.


        :param internal_type: The internal_type of this OdxAny.
        :type internal_type: DataType
        """

        self._internal_type = internal_type

    @property
    def v(self) -> str:
        """Gets the v of this OdxAny.


        :return: The v of this OdxAny.
        :rtype: str
        """
        return self._v

    @v.setter
    def v(self, v: str):
        """Sets the v of this OdxAny.


        :param v: The v of this OdxAny.
        :type v: str
        """

        self._v = v

    @property
    def vt(self) -> str:
        """Gets the vt of this OdxAny.


        :return: The vt of this OdxAny.
        :rtype: str
        """
        return self._vt

    @vt.setter
    def vt(self, vt: str):
        """Sets the vt of this OdxAny.


        :param vt: The vt of this OdxAny.
        :type vt: str
        """

        self._vt = vt

    @property
    def data_type(self) -> str:
        """Gets the data_type of this OdxAny.


        :return: The data_type of this OdxAny.
        :rtype: str
        """
        return self._data_type

    @data_type.setter
    def data_type(self, data_type: str):
        """Sets the data_type of this OdxAny.


        :param data_type: The data_type of this OdxAny.
        :type data_type: str
        """

        self._data_type = data_type

    @property
    def compu_inverse_value(self) -> CompuConst:
        """Gets the compu_inverse_value of this OdxAny.


        :return: The compu_inverse_value of this OdxAny.
        :rtype: CompuConst
        """
        return self._compu_inverse_value

    @compu_inverse_value.setter
    def compu_inverse_value(self, compu_inverse_value: CompuConst):
        """Sets the compu_inverse_value of this OdxAny.


        :param compu_inverse_value: The compu_inverse_value of this OdxAny.
        :type compu_inverse_value: CompuConst
        """

        self._compu_inverse_value = compu_inverse_value

    @property
    def compu_scales(self) -> List[CompuScale]:
        """Gets the compu_scales of this OdxAny.


        :return: The compu_scales of this OdxAny.
        :rtype: List[CompuScale]
        """
        return self._compu_scales

    @compu_scales.setter
    def compu_scales(self, compu_scales: List[CompuScale]):
        """Sets the compu_scales of this OdxAny.


        :param compu_scales: The compu_scales of this OdxAny.
        :type compu_scales: List[CompuScale]
        """

        self._compu_scales = compu_scales

    @property
    def prog_code(self) -> ProgCode:
        """Gets the prog_code of this OdxAny.


        :return: The prog_code of this OdxAny.
        :rtype: ProgCode
        """
        return self._prog_code

    @prog_code.setter
    def prog_code(self, prog_code: ProgCode):
        """Sets the prog_code of this OdxAny.


        :param prog_code: The prog_code of this OdxAny.
        :type prog_code: ProgCode
        """

        self._prog_code = prog_code

    @property
    def compu_default_value(self) -> CompuDefaultValue:
        """Gets the compu_default_value of this OdxAny.


        :return: The compu_default_value of this OdxAny.
        :rtype: CompuDefaultValue
        """
        return self._compu_default_value

    @compu_default_value.setter
    def compu_default_value(self, compu_default_value: CompuDefaultValue):
        """Sets the compu_default_value of this OdxAny.


        :param compu_default_value: The compu_default_value of this OdxAny.
        :type compu_default_value: CompuDefaultValue
        """

        self._compu_default_value = compu_default_value

    @property
    def numerators(self) -> List[CompuRationalCoeffsNumeratorsInner]:
        """Gets the numerators of this OdxAny.


        :return: The numerators of this OdxAny.
        :rtype: List[CompuRationalCoeffsNumeratorsInner]
        """
        return self._numerators

    @numerators.setter
    def numerators(self, numerators: List[CompuRationalCoeffsNumeratorsInner]):
        """Sets the numerators of this OdxAny.


        :param numerators: The numerators of this OdxAny.
        :type numerators: List[CompuRationalCoeffsNumeratorsInner]
        """

        self._numerators = numerators

    @property
    def denominators(self) -> List[CompuRationalCoeffsNumeratorsInner]:
        """Gets the denominators of this OdxAny.


        :return: The denominators of this OdxAny.
        :rtype: List[CompuRationalCoeffsNumeratorsInner]
        """
        return self._denominators

    @denominators.setter
    def denominators(self, denominators: List[CompuRationalCoeffsNumeratorsInner]):
        """Sets the denominators of this OdxAny.


        :param denominators: The denominators of this OdxAny.
        :type denominators: List[CompuRationalCoeffsNumeratorsInner]
        """

        self._denominators = denominators

    @property
    def short_label(self) -> str:
        """Gets the short_label of this OdxAny.


        :return: The short_label of this OdxAny.
        :rtype: str
        """
        return self._short_label

    @short_label.setter
    def short_label(self, short_label: str):
        """Sets the short_label of this OdxAny.


        :param short_label: The short_label of this OdxAny.
        :type short_label: str
        """

        self._short_label = short_label

    @property
    def lower_limit(self) -> Limit:
        """Gets the lower_limit of this OdxAny.


        :return: The lower_limit of this OdxAny.
        :rtype: Limit
        """
        return self._lower_limit

    @lower_limit.setter
    def lower_limit(self, lower_limit: Limit):
        """Sets the lower_limit of this OdxAny.


        :param lower_limit: The lower_limit of this OdxAny.
        :type lower_limit: Limit
        """

        self._lower_limit = lower_limit

    @property
    def upper_limit(self) -> Limit:
        """Gets the upper_limit of this OdxAny.


        :return: The upper_limit of this OdxAny.
        :rtype: Limit
        """
        return self._upper_limit

    @upper_limit.setter
    def upper_limit(self, upper_limit: Limit):
        """Sets the upper_limit of this OdxAny.


        :param upper_limit: The upper_limit of this OdxAny.
        :type upper_limit: Limit
        """

        self._upper_limit = upper_limit

    @property
    def compu_const(self) -> CompuConst:
        """Gets the compu_const of this OdxAny.


        :return: The compu_const of this OdxAny.
        :rtype: CompuConst
        """
        return self._compu_const

    @compu_const.setter
    def compu_const(self, compu_const: CompuConst):
        """Sets the compu_const of this OdxAny.


        :param compu_const: The compu_const of this OdxAny.
        :type compu_const: CompuConst
        """

        self._compu_const = compu_const

    @property
    def compu_rational_coeffs(self) -> CompuRationalCoeffs:
        """Gets the compu_rational_coeffs of this OdxAny.


        :return: The compu_rational_coeffs of this OdxAny.
        :rtype: CompuRationalCoeffs
        """
        return self._compu_rational_coeffs

    @compu_rational_coeffs.setter
    def compu_rational_coeffs(self, compu_rational_coeffs: CompuRationalCoeffs):
        """Sets the compu_rational_coeffs of this OdxAny.


        :param compu_rational_coeffs: The compu_rational_coeffs of this OdxAny.
        :type compu_rational_coeffs: CompuRationalCoeffs
        """

        self._compu_rational_coeffs = compu_rational_coeffs

    @property
    def domain_type(self) -> DataType:
        """Gets the domain_type of this OdxAny.


        :return: The domain_type of this OdxAny.
        :rtype: DataType
        """
        return self._domain_type

    @domain_type.setter
    def domain_type(self, domain_type: DataType):
        """Sets the domain_type of this OdxAny.


        :param domain_type: The domain_type of this OdxAny.
        :type domain_type: DataType
        """

        self._domain_type = domain_type

    @property
    def range_type(self) -> DataType:
        """Gets the range_type of this OdxAny.


        :return: The range_type of this OdxAny.
        :rtype: DataType
        """
        return self._range_type

    @range_type.setter
    def range_type(self, range_type: DataType):
        """Sets the range_type of this OdxAny.


        :param range_type: The range_type of this OdxAny.
        :type range_type: DataType
        """

        self._range_type = range_type

    @property
    def valid_base_variants(self) -> List[ValidBaseVariant]:
        """Gets the valid_base_variants of this OdxAny.


        :return: The valid_base_variants of this OdxAny.
        :rtype: List[ValidBaseVariant]
        """
        return self._valid_base_variants

    @valid_base_variants.setter
    def valid_base_variants(self, valid_base_variants: List[ValidBaseVariant]):
        """Sets the valid_base_variants of this OdxAny.


        :param valid_base_variants: The valid_base_variants of this OdxAny.
        :type valid_base_variants: List[ValidBaseVariant]
        """

        self._valid_base_variants = valid_base_variants

    @property
    def config_records(self) -> List[ConfigRecord]:
        """Gets the config_records of this OdxAny.


        :return: The config_records of this OdxAny.
        :rtype: List[ConfigRecord]
        """
        return self._config_records

    @config_records.setter
    def config_records(self, config_records: List[ConfigRecord]):
        """Sets the config_records of this OdxAny.


        :param config_records: The config_records of this OdxAny.
        :type config_records: List[ConfigRecord]
        """

        self._config_records = config_records

    @property
    def data_object_prop_ref(self) -> OdxLinkRef:
        """Gets the data_object_prop_ref of this OdxAny.


        :return: The data_object_prop_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._data_object_prop_ref

    @data_object_prop_ref.setter
    def data_object_prop_ref(self, data_object_prop_ref: OdxLinkRef):
        """Sets the data_object_prop_ref of this OdxAny.


        :param data_object_prop_ref: The data_object_prop_ref of this OdxAny.
        :type data_object_prop_ref: OdxLinkRef
        """

        self._data_object_prop_ref = data_object_prop_ref

    @property
    def data_object_prop_snref(self) -> str:
        """Gets the data_object_prop_snref of this OdxAny.


        :return: The data_object_prop_snref of this OdxAny.
        :rtype: str
        """
        return self._data_object_prop_snref

    @data_object_prop_snref.setter
    def data_object_prop_snref(self, data_object_prop_snref: str):
        """Sets the data_object_prop_snref of this OdxAny.


        :param data_object_prop_snref: The data_object_prop_snref of this OdxAny.
        :type data_object_prop_snref: str
        """

        self._data_object_prop_snref = data_object_prop_snref

    @property
    def data_object_prop(self) -> DopBase:
        """Gets the data_object_prop of this OdxAny.


        :return: The data_object_prop of this OdxAny.
        :rtype: DopBase
        """
        return self._data_object_prop

    @data_object_prop.setter
    def data_object_prop(self, data_object_prop: DopBase):
        """Sets the data_object_prop of this OdxAny.


        :param data_object_prop: The data_object_prop of this OdxAny.
        :type data_object_prop: DopBase
        """

        self._data_object_prop = data_object_prop

    @property
    def config_id_item(self) -> ConfigIdItem:
        """Gets the config_id_item of this OdxAny.


        :return: The config_id_item of this OdxAny.
        :rtype: ConfigIdItem
        """
        return self._config_id_item

    @config_id_item.setter
    def config_id_item(self, config_id_item: ConfigIdItem):
        """Sets the config_id_item of this OdxAny.


        :param config_id_item: The config_id_item of this OdxAny.
        :type config_id_item: ConfigIdItem
        """

        self._config_id_item = config_id_item

    @property
    def diag_comm_data_connectors(self) -> List[DiagCommDataConnector]:
        """Gets the diag_comm_data_connectors of this OdxAny.


        :return: The diag_comm_data_connectors of this OdxAny.
        :rtype: List[DiagCommDataConnector]
        """
        return self._diag_comm_data_connectors

    @diag_comm_data_connectors.setter
    def diag_comm_data_connectors(self, diag_comm_data_connectors: List[DiagCommDataConnector]):
        """Sets the diag_comm_data_connectors of this OdxAny.


        :param diag_comm_data_connectors: The diag_comm_data_connectors of this OdxAny.
        :type diag_comm_data_connectors: List[DiagCommDataConnector]
        """

        self._diag_comm_data_connectors = diag_comm_data_connectors

    @property
    def config_id(self) -> IdentValue:
        """Gets the config_id of this OdxAny.


        :return: The config_id of this OdxAny.
        :rtype: IdentValue
        """
        return self._config_id

    @config_id.setter
    def config_id(self, config_id: IdentValue):
        """Sets the config_id of this OdxAny.


        :param config_id: The config_id of this OdxAny.
        :type config_id: IdentValue
        """

        self._config_id = config_id

    @property
    def data_records(self) -> List[DataRecord]:
        """Gets the data_records of this OdxAny.


        :return: The data_records of this OdxAny.
        :rtype: List[DataRecord]
        """
        return self._data_records

    @data_records.setter
    def data_records(self, data_records: List[DataRecord]):
        """Sets the data_records of this OdxAny.


        :param data_records: The data_records of this OdxAny.
        :type data_records: List[DataRecord]
        """

        self._data_records = data_records

    @property
    def system_items(self) -> List[SystemItem]:
        """Gets the system_items of this OdxAny.


        :return: The system_items of this OdxAny.
        :rtype: List[SystemItem]
        """
        return self._system_items

    @system_items.setter
    def system_items(self, system_items: List[SystemItem]):
        """Sets the system_items of this OdxAny.


        :param system_items: The system_items of this OdxAny.
        :type system_items: List[SystemItem]
        """

        self._system_items = system_items

    @property
    def data_id_item(self) -> DataIdItem:
        """Gets the data_id_item of this OdxAny.


        :return: The data_id_item of this OdxAny.
        :rtype: DataIdItem
        """
        return self._data_id_item

    @data_id_item.setter
    def data_id_item(self, data_id_item: DataIdItem):
        """Sets the data_id_item of this OdxAny.


        :param data_id_item: The data_id_item of this OdxAny.
        :type data_id_item: DataIdItem
        """

        self._data_id_item = data_id_item

    @property
    def option_items(self) -> List[OptionItem]:
        """Gets the option_items of this OdxAny.


        :return: The option_items of this OdxAny.
        :rtype: List[OptionItem]
        """
        return self._option_items

    @option_items.setter
    def option_items(self, option_items: List[OptionItem]):
        """Sets the option_items of this OdxAny.


        :param option_items: The option_items of this OdxAny.
        :type option_items: List[OptionItem]
        """

        self._option_items = option_items

    @property
    def default_data_record_snref(self) -> str:
        """Gets the default_data_record_snref of this OdxAny.


        :return: The default_data_record_snref of this OdxAny.
        :rtype: str
        """
        return self._default_data_record_snref

    @default_data_record_snref.setter
    def default_data_record_snref(self, default_data_record_snref: str):
        """Sets the default_data_record_snref of this OdxAny.


        :param default_data_record_snref: The default_data_record_snref of this OdxAny.
        :type default_data_record_snref: str
        """

        self._default_data_record_snref = default_data_record_snref

    @property
    def compu_method(self) -> CompuMethod:
        """Gets the compu_method of this OdxAny.


        :return: The compu_method of this OdxAny.
        :rtype: CompuMethod
        """
        return self._compu_method

    @compu_method.setter
    def compu_method(self, compu_method: CompuMethod):
        """Sets the compu_method of this OdxAny.


        :param compu_method: The compu_method of this OdxAny.
        :type compu_method: CompuMethod
        """

        self._compu_method = compu_method

    @property
    def internal_constr(self) -> InternalConstr:
        """Gets the internal_constr of this OdxAny.


        :return: The internal_constr of this OdxAny.
        :rtype: InternalConstr
        """
        return self._internal_constr

    @internal_constr.setter
    def internal_constr(self, internal_constr: InternalConstr):
        """Sets the internal_constr of this OdxAny.


        :param internal_constr: The internal_constr of this OdxAny.
        :type internal_constr: InternalConstr
        """

        self._internal_constr = internal_constr

    @property
    def unit_ref(self) -> OdxLinkRef:
        """Gets the unit_ref of this OdxAny.


        :return: The unit_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._unit_ref

    @unit_ref.setter
    def unit_ref(self, unit_ref: OdxLinkRef):
        """Sets the unit_ref of this OdxAny.


        :param unit_ref: The unit_ref of this OdxAny.
        :type unit_ref: OdxLinkRef
        """

        self._unit_ref = unit_ref

    @property
    def physical_constr(self) -> InternalConstr:
        """Gets the physical_constr of this OdxAny.


        :return: The physical_constr of this OdxAny.
        :rtype: InternalConstr
        """
        return self._physical_constr

    @physical_constr.setter
    def physical_constr(self, physical_constr: InternalConstr):
        """Sets the physical_constr of this OdxAny.


        :param physical_constr: The physical_constr of this OdxAny.
        :type physical_constr: InternalConstr
        """

        self._physical_constr = physical_constr

    @property
    def unit(self) -> Unit:
        """Gets the unit of this OdxAny.


        :return: The unit of this OdxAny.
        :rtype: Unit
        """
        return self._unit

    @unit.setter
    def unit(self, unit: Unit):
        """Sets the unit of this OdxAny.


        :param unit: The unit of this OdxAny.
        :type unit: Unit
        """

        self._unit = unit

    @property
    def rule(self) -> str:
        """Gets the rule of this OdxAny.


        :return: The rule of this OdxAny.
        :rtype: str
        """
        return self._rule

    @rule.setter
    def rule(self, rule: str):
        """Sets the rule of this OdxAny.


        :param rule: The rule of this OdxAny.
        :type rule: str
        """

        self._rule = rule

    @property
    def key(self) -> LimitValue:
        """Gets the key of this OdxAny.


        :return: The key of this OdxAny.
        :rtype: LimitValue
        """
        return self._key

    @key.setter
    def key(self, key: LimitValue):
        """Sets the key of this OdxAny.


        :param key: The key of this OdxAny.
        :type key: LimitValue
        """

        self._key = key

    @property
    def data_id(self) -> IdentValue:
        """Gets the data_id of this OdxAny.


        :return: The data_id of this OdxAny.
        :rtype: IdentValue
        """
        return self._data_id

    @data_id.setter
    def data_id(self, data_id: IdentValue):
        """Sets the data_id of this OdxAny.


        :param data_id: The data_id of this OdxAny.
        :type data_id: IdentValue
        """

        self._data_id = data_id

    @property
    def datafile(self) -> Datafile:
        """Gets the datafile of this OdxAny.


        :return: The datafile of this OdxAny.
        :rtype: Datafile
        """
        return self._datafile

    @datafile.setter
    def datafile(self, datafile: Datafile):
        """Sets the datafile of this OdxAny.


        :param datafile: The datafile of this OdxAny.
        :type datafile: Datafile
        """

        self._datafile = datafile

    @property
    def data(self) -> str:
        """Gets the data of this OdxAny.


        :return: The data of this OdxAny.
        :rtype: str
        """
        return self._data

    @data.setter
    def data(self, data: str):
        """Sets the data of this OdxAny.


        :param data: The data of this OdxAny.
        :type data: str
        """

        self._data = data

    @property
    def dataformat(self) -> Dataformat:
        """Gets the dataformat of this OdxAny.


        :return: The dataformat of this OdxAny.
        :rtype: Dataformat
        """
        return self._dataformat

    @dataformat.setter
    def dataformat(self, dataformat: Dataformat):
        """Sets the dataformat of this OdxAny.


        :param dataformat: The dataformat of this OdxAny.
        :type dataformat: Dataformat
        """

        self._dataformat = dataformat

    @property
    def logical_block_index(self) -> int:
        """Gets the logical_block_index of this OdxAny.


        :return: The logical_block_index of this OdxAny.
        :rtype: int
        """
        return self._logical_block_index

    @logical_block_index.setter
    def logical_block_index(self, logical_block_index: int):
        """Sets the logical_block_index of this OdxAny.


        :param logical_block_index: The logical_block_index of this OdxAny.
        :type logical_block_index: int
        """

        self._logical_block_index = logical_block_index

    @property
    def flashdata_ref(self) -> OdxLinkRef:
        """Gets the flashdata_ref of this OdxAny.


        :return: The flashdata_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._flashdata_ref

    @flashdata_ref.setter
    def flashdata_ref(self, flashdata_ref: OdxLinkRef):
        """Sets the flashdata_ref of this OdxAny.


        :param flashdata_ref: The flashdata_ref of this OdxAny.
        :type flashdata_ref: OdxLinkRef
        """

        self._flashdata_ref = flashdata_ref

    @property
    def filters(self) -> List[Filter]:
        """Gets the filters of this OdxAny.


        :return: The filters of this OdxAny.
        :rtype: List[Filter]
        """
        return self._filters

    @filters.setter
    def filters(self, filters: List[Filter]):
        """Sets the filters of this OdxAny.


        :param filters: The filters of this OdxAny.
        :type filters: List[Filter]
        """

        self._filters = filters

    @property
    def segments(self) -> List[Segment]:
        """Gets the segments of this OdxAny.


        :return: The segments of this OdxAny.
        :rtype: List[Segment]
        """
        return self._segments

    @segments.setter
    def segments(self, segments: List[Segment]):
        """Sets the segments of this OdxAny.


        :param segments: The segments of this OdxAny.
        :type segments: List[Segment]
        """

        self._segments = segments

    @property
    def target_addr_offset(self) -> TargetAddrOffset:
        """Gets the target_addr_offset of this OdxAny.


        :return: The target_addr_offset of this OdxAny.
        :rtype: TargetAddrOffset
        """
        return self._target_addr_offset

    @target_addr_offset.setter
    def target_addr_offset(self, target_addr_offset: TargetAddrOffset):
        """Sets the target_addr_offset of this OdxAny.


        :param target_addr_offset: The target_addr_offset of this OdxAny.
        :type target_addr_offset: TargetAddrOffset
        """

        self._target_addr_offset = target_addr_offset

    @property
    def own_idents(self) -> List[OwnIdent]:
        """Gets the own_idents of this OdxAny.


        :return: The own_idents of this OdxAny.
        :rtype: List[OwnIdent]
        """
        return self._own_idents

    @own_idents.setter
    def own_idents(self, own_idents: List[OwnIdent]):
        """Sets the own_idents of this OdxAny.


        :param own_idents: The own_idents of this OdxAny.
        :type own_idents: List[OwnIdent]
        """

        self._own_idents = own_idents

    @property
    def securities(self) -> List[Security]:
        """Gets the securities of this OdxAny.


        :return: The securities of this OdxAny.
        :rtype: List[Security]
        """
        return self._securities

    @securities.setter
    def securities(self, securities: List[Security]):
        """Sets the securities of this OdxAny.


        :param securities: The securities of this OdxAny.
        :type securities: List[Security]
        """

        self._securities = securities

    @property
    def flashdata(self) -> Flashdata:
        """Gets the flashdata of this OdxAny.


        :return: The flashdata of this OdxAny.
        :rtype: Flashdata
        """
        return self._flashdata

    @flashdata.setter
    def flashdata(self, flashdata: Flashdata):
        """Sets the flashdata of this OdxAny.


        :param flashdata: The flashdata of this OdxAny.
        :type flashdata: Flashdata
        """

        self._flashdata = flashdata

    @property
    def latebound_datafile(self) -> bool:
        """Gets the latebound_datafile of this OdxAny.


        :return: The latebound_datafile of this OdxAny.
        :rtype: bool
        """
        return self._latebound_datafile

    @latebound_datafile.setter
    def latebound_datafile(self, latebound_datafile: bool):
        """Sets the latebound_datafile of this OdxAny.


        :param latebound_datafile: The latebound_datafile of this OdxAny.
        :type latebound_datafile: bool
        """

        self._latebound_datafile = latebound_datafile

    @property
    def selection(self) -> DataformatSelection:
        """Gets the selection of this OdxAny.


        :return: The selection of this OdxAny.
        :rtype: DataformatSelection
        """
        return self._selection

    @selection.setter
    def selection(self, selection: DataformatSelection):
        """Sets the selection of this OdxAny.


        :param selection: The selection of this OdxAny.
        :type selection: DataformatSelection
        """

        self._selection = selection

    @property
    def user_selection(self) -> str:
        """Gets the user_selection of this OdxAny.


        :return: The user_selection of this OdxAny.
        :rtype: str
        """
        return self._user_selection

    @user_selection.setter
    def user_selection(self, user_selection: str):
        """Sets the user_selection of this OdxAny.


        :param user_selection: The user_selection of this OdxAny.
        :type user_selection: str
        """

        self._user_selection = user_selection

    @property
    def text(self) -> str:
        """Gets the text of this OdxAny.


        :return: The text of this OdxAny.
        :rtype: str
        """
        return self._text

    @text.setter
    def text(self, text: str):
        """Sets the text of this OdxAny.


        :param text: The text of this OdxAny.
        :type text: str
        """

        self._text = text

    @property
    def external_docs(self) -> List[ExternalDoc]:
        """Gets the external_docs of this OdxAny.


        :return: The external_docs of this OdxAny.
        :rtype: List[ExternalDoc]
        """
        return self._external_docs

    @external_docs.setter
    def external_docs(self, external_docs: List[ExternalDoc]):
        """Sets the external_docs of this OdxAny.


        :param external_docs: The external_docs of this OdxAny.
        :type external_docs: List[ExternalDoc]
        """

        self._external_docs = external_docs

    @property
    def text_identifier(self) -> str:
        """Gets the text_identifier of this OdxAny.


        :return: The text_identifier of this OdxAny.
        :rtype: str
        """
        return self._text_identifier

    @text_identifier.setter
    def text_identifier(self, text_identifier: str):
        """Sets the text_identifier of this OdxAny.


        :param text_identifier: The text_identifier of this OdxAny.
        :type text_identifier: str
        """

        self._text_identifier = text_identifier

    @property
    def base_type_encoding(self) -> Encoding:
        """Gets the base_type_encoding of this OdxAny.


        :return: The base_type_encoding of this OdxAny.
        :rtype: Encoding
        """
        return self._base_type_encoding

    @base_type_encoding.setter
    def base_type_encoding(self, base_type_encoding: Encoding):
        """Sets the base_type_encoding of this OdxAny.


        :param base_type_encoding: The base_type_encoding of this OdxAny.
        :type base_type_encoding: Encoding
        """

        self._base_type_encoding = base_type_encoding

    @property
    def base_data_type(self) -> DataType:
        """Gets the base_data_type of this OdxAny.


        :return: The base_data_type of this OdxAny.
        :rtype: DataType
        """
        return self._base_data_type

    @base_data_type.setter
    def base_data_type(self, base_data_type: DataType):
        """Sets the base_data_type of this OdxAny.


        :param base_data_type: The base_data_type of this OdxAny.
        :type base_data_type: DataType
        """

        self._base_data_type = base_data_type

    @property
    def is_highlow_byte_order_raw(self) -> bool:
        """Gets the is_highlow_byte_order_raw of this OdxAny.


        :return: The is_highlow_byte_order_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_highlow_byte_order_raw

    @is_highlow_byte_order_raw.setter
    def is_highlow_byte_order_raw(self, is_highlow_byte_order_raw: bool):
        """Sets the is_highlow_byte_order_raw of this OdxAny.


        :param is_highlow_byte_order_raw: The is_highlow_byte_order_raw of this OdxAny.
        :type is_highlow_byte_order_raw: bool
        """

        self._is_highlow_byte_order_raw = is_highlow_byte_order_raw

    @property
    def is_highlow_byte_order(self) -> bool:
        """Gets the is_highlow_byte_order of this OdxAny.


        :return: The is_highlow_byte_order of this OdxAny.
        :rtype: bool
        """
        return self._is_highlow_byte_order

    @is_highlow_byte_order.setter
    def is_highlow_byte_order(self, is_highlow_byte_order: bool):
        """Sets the is_highlow_byte_order of this OdxAny.


        :param is_highlow_byte_order: The is_highlow_byte_order of this OdxAny.
        :type is_highlow_byte_order: bool
        """

        self._is_highlow_byte_order = is_highlow_byte_order

    @property
    def functional_class_refs(self) -> List[OdxLinkRef]:
        """Gets the functional_class_refs of this OdxAny.


        :return: The functional_class_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._functional_class_refs

    @functional_class_refs.setter
    def functional_class_refs(self, functional_class_refs: List[OdxLinkRef]):
        """Sets the functional_class_refs of this OdxAny.


        :param functional_class_refs: The functional_class_refs of this OdxAny.
        :type functional_class_refs: List[OdxLinkRef]
        """

        self._functional_class_refs = functional_class_refs

    @property
    def protocol_snrefs(self) -> List[str]:
        """Gets the protocol_snrefs of this OdxAny.


        :return: The protocol_snrefs of this OdxAny.
        :rtype: List[str]
        """
        return self._protocol_snrefs

    @protocol_snrefs.setter
    def protocol_snrefs(self, protocol_snrefs: List[str]):
        """Sets the protocol_snrefs of this OdxAny.


        :param protocol_snrefs: The protocol_snrefs of this OdxAny.
        :type protocol_snrefs: List[str]
        """

        self._protocol_snrefs = protocol_snrefs

    @property
    def related_diag_comm_refs(self) -> List[RelatedDiagCommRef]:
        """Gets the related_diag_comm_refs of this OdxAny.


        :return: The related_diag_comm_refs of this OdxAny.
        :rtype: List[RelatedDiagCommRef]
        """
        return self._related_diag_comm_refs

    @related_diag_comm_refs.setter
    def related_diag_comm_refs(self, related_diag_comm_refs: List[RelatedDiagCommRef]):
        """Sets the related_diag_comm_refs of this OdxAny.


        :param related_diag_comm_refs: The related_diag_comm_refs of this OdxAny.
        :type related_diag_comm_refs: List[RelatedDiagCommRef]
        """

        self._related_diag_comm_refs = related_diag_comm_refs

    @property
    def pre_condition_state_refs(self) -> List[PreConditionStateRef]:
        """Gets the pre_condition_state_refs of this OdxAny.


        :return: The pre_condition_state_refs of this OdxAny.
        :rtype: List[PreConditionStateRef]
        """
        return self._pre_condition_state_refs

    @pre_condition_state_refs.setter
    def pre_condition_state_refs(self, pre_condition_state_refs: List[PreConditionStateRef]):
        """Sets the pre_condition_state_refs of this OdxAny.


        :param pre_condition_state_refs: The pre_condition_state_refs of this OdxAny.
        :type pre_condition_state_refs: List[PreConditionStateRef]
        """

        self._pre_condition_state_refs = pre_condition_state_refs

    @property
    def state_transition_refs(self) -> List[StateTransitionRef]:
        """Gets the state_transition_refs of this OdxAny.


        :return: The state_transition_refs of this OdxAny.
        :rtype: List[StateTransitionRef]
        """
        return self._state_transition_refs

    @state_transition_refs.setter
    def state_transition_refs(self, state_transition_refs: List[StateTransitionRef]):
        """Sets the state_transition_refs of this OdxAny.


        :param state_transition_refs: The state_transition_refs of this OdxAny.
        :type state_transition_refs: List[StateTransitionRef]
        """

        self._state_transition_refs = state_transition_refs

    @property
    def diagnostic_class(self) -> DiagClassType:
        """Gets the diagnostic_class of this OdxAny.


        :return: The diagnostic_class of this OdxAny.
        :rtype: DiagClassType
        """
        return self._diagnostic_class

    @diagnostic_class.setter
    def diagnostic_class(self, diagnostic_class: DiagClassType):
        """Sets the diagnostic_class of this OdxAny.


        :param diagnostic_class: The diagnostic_class of this OdxAny.
        :type diagnostic_class: DiagClassType
        """

        self._diagnostic_class = diagnostic_class

    @property
    def is_mandatory_raw(self) -> bool:
        """Gets the is_mandatory_raw of this OdxAny.


        :return: The is_mandatory_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_mandatory_raw

    @is_mandatory_raw.setter
    def is_mandatory_raw(self, is_mandatory_raw: bool):
        """Sets the is_mandatory_raw of this OdxAny.


        :param is_mandatory_raw: The is_mandatory_raw of this OdxAny.
        :type is_mandatory_raw: bool
        """

        self._is_mandatory_raw = is_mandatory_raw

    @property
    def is_mandatory(self) -> bool:
        """Gets the is_mandatory of this OdxAny.


        :return: The is_mandatory of this OdxAny.
        :rtype: bool
        """
        return self._is_mandatory

    @is_mandatory.setter
    def is_mandatory(self, is_mandatory: bool):
        """Sets the is_mandatory of this OdxAny.


        :param is_mandatory: The is_mandatory of this OdxAny.
        :type is_mandatory: bool
        """

        self._is_mandatory = is_mandatory

    @property
    def is_executable_raw(self) -> bool:
        """Gets the is_executable_raw of this OdxAny.


        :return: The is_executable_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_executable_raw

    @is_executable_raw.setter
    def is_executable_raw(self, is_executable_raw: bool):
        """Sets the is_executable_raw of this OdxAny.


        :param is_executable_raw: The is_executable_raw of this OdxAny.
        :type is_executable_raw: bool
        """

        self._is_executable_raw = is_executable_raw

    @property
    def is_executable(self) -> bool:
        """Gets the is_executable of this OdxAny.


        :return: The is_executable of this OdxAny.
        :rtype: bool
        """
        return self._is_executable

    @is_executable.setter
    def is_executable(self, is_executable: bool):
        """Sets the is_executable of this OdxAny.


        :param is_executable: The is_executable of this OdxAny.
        :type is_executable: bool
        """

        self._is_executable = is_executable

    @property
    def is_final_raw(self) -> bool:
        """Gets the is_final_raw of this OdxAny.


        :return: The is_final_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_final_raw

    @is_final_raw.setter
    def is_final_raw(self, is_final_raw: bool):
        """Sets the is_final_raw of this OdxAny.


        :param is_final_raw: The is_final_raw of this OdxAny.
        :type is_final_raw: bool
        """

        self._is_final_raw = is_final_raw

    @property
    def is_final(self) -> bool:
        """Gets the is_final of this OdxAny.


        :return: The is_final of this OdxAny.
        :rtype: bool
        """
        return self._is_final

    @is_final.setter
    def is_final(self, is_final: bool):
        """Sets the is_final of this OdxAny.


        :param is_final: The is_final of this OdxAny.
        :type is_final: bool
        """

        self._is_final = is_final

    @property
    def read_diag_comm_connector(self) -> ReadDiagCommConnector:
        """Gets the read_diag_comm_connector of this OdxAny.


        :return: The read_diag_comm_connector of this OdxAny.
        :rtype: ReadDiagCommConnector
        """
        return self._read_diag_comm_connector

    @read_diag_comm_connector.setter
    def read_diag_comm_connector(self, read_diag_comm_connector: ReadDiagCommConnector):
        """Sets the read_diag_comm_connector of this OdxAny.


        :param read_diag_comm_connector: The read_diag_comm_connector of this OdxAny.
        :type read_diag_comm_connector: ReadDiagCommConnector
        """

        self._read_diag_comm_connector = read_diag_comm_connector

    @property
    def write_diag_comm_connector(self) -> WriteDiagCommConnector:
        """Gets the write_diag_comm_connector of this OdxAny.


        :return: The write_diag_comm_connector of this OdxAny.
        :rtype: WriteDiagCommConnector
        """
        return self._write_diag_comm_connector

    @write_diag_comm_connector.setter
    def write_diag_comm_connector(self, write_diag_comm_connector: WriteDiagCommConnector):
        """Sets the write_diag_comm_connector of this OdxAny.


        :param write_diag_comm_connector: The write_diag_comm_connector of this OdxAny.
        :type write_diag_comm_connector: WriteDiagCommConnector
        """

        self._write_diag_comm_connector = write_diag_comm_connector

    @property
    def protocols(self) -> List[Protocol]:
        """Gets the protocols of this OdxAny.


        :return: The protocols of this OdxAny.
        :rtype: List[Protocol]
        """
        return self._protocols

    @protocols.setter
    def protocols(self, protocols: List[Protocol]):
        """Sets the protocols of this OdxAny.


        :param protocols: The protocols of this OdxAny.
        :type protocols: List[Protocol]
        """

        self._protocols = protocols

    @property
    def pre_condition_states(self) -> List[State]:
        """Gets the pre_condition_states of this OdxAny.


        :return: The pre_condition_states of this OdxAny.
        :rtype: List[State]
        """
        return self._pre_condition_states

    @pre_condition_states.setter
    def pre_condition_states(self, pre_condition_states: List[State]):
        """Sets the pre_condition_states of this OdxAny.


        :param pre_condition_states: The pre_condition_states of this OdxAny.
        :type pre_condition_states: List[State]
        """

        self._pre_condition_states = pre_condition_states

    @property
    def state_transitions(self) -> List[StateTransition]:
        """Gets the state_transitions of this OdxAny.


        :return: The state_transitions of this OdxAny.
        :rtype: List[StateTransition]
        """
        return self._state_transitions

    @state_transitions.setter
    def state_transitions(self, state_transitions: List[StateTransition]):
        """Sets the state_transitions of this OdxAny.


        :param state_transitions: The state_transitions of this OdxAny.
        :type state_transitions: List[StateTransition]
        """

        self._state_transitions = state_transitions

    @property
    def dtc_dops(self) -> List[DtcDop]:
        """Gets the dtc_dops of this OdxAny.


        :return: The dtc_dops of this OdxAny.
        :rtype: List[DtcDop]
        """
        return self._dtc_dops

    @dtc_dops.setter
    def dtc_dops(self, dtc_dops: List[DtcDop]):
        """Sets the dtc_dops of this OdxAny.


        :param dtc_dops: The dtc_dops of this OdxAny.
        :type dtc_dops: List[DtcDop]
        """

        self._dtc_dops = dtc_dops

    @property
    def env_data_descs(self) -> List[EnvironmentDataDescription]:
        """Gets the env_data_descs of this OdxAny.


        :return: The env_data_descs of this OdxAny.
        :rtype: List[EnvironmentDataDescription]
        """
        return self._env_data_descs

    @env_data_descs.setter
    def env_data_descs(self, env_data_descs: List[EnvironmentDataDescription]):
        """Sets the env_data_descs of this OdxAny.


        :param env_data_descs: The env_data_descs of this OdxAny.
        :type env_data_descs: List[EnvironmentDataDescription]
        """

        self._env_data_descs = env_data_descs

    @property
    def structures(self) -> List[Structure]:
        """Gets the structures of this OdxAny.


        :return: The structures of this OdxAny.
        :rtype: List[Structure]
        """
        return self._structures

    @structures.setter
    def structures(self, structures: List[Structure]):
        """Sets the structures of this OdxAny.


        :param structures: The structures of this OdxAny.
        :type structures: List[Structure]
        """

        self._structures = structures

    @property
    def static_fields(self) -> List[StaticField]:
        """Gets the static_fields of this OdxAny.


        :return: The static_fields of this OdxAny.
        :rtype: List[StaticField]
        """
        return self._static_fields

    @static_fields.setter
    def static_fields(self, static_fields: List[StaticField]):
        """Sets the static_fields of this OdxAny.


        :param static_fields: The static_fields of this OdxAny.
        :type static_fields: List[StaticField]
        """

        self._static_fields = static_fields

    @property
    def dynamic_length_fields(self) -> List[DynamicLengthField]:
        """Gets the dynamic_length_fields of this OdxAny.


        :return: The dynamic_length_fields of this OdxAny.
        :rtype: List[DynamicLengthField]
        """
        return self._dynamic_length_fields

    @dynamic_length_fields.setter
    def dynamic_length_fields(self, dynamic_length_fields: List[DynamicLengthField]):
        """Sets the dynamic_length_fields of this OdxAny.


        :param dynamic_length_fields: The dynamic_length_fields of this OdxAny.
        :type dynamic_length_fields: List[DynamicLengthField]
        """

        self._dynamic_length_fields = dynamic_length_fields

    @property
    def dynamic_endmarker_fields(self) -> List[DynamicEndmarkerField]:
        """Gets the dynamic_endmarker_fields of this OdxAny.


        :return: The dynamic_endmarker_fields of this OdxAny.
        :rtype: List[DynamicEndmarkerField]
        """
        return self._dynamic_endmarker_fields

    @dynamic_endmarker_fields.setter
    def dynamic_endmarker_fields(self, dynamic_endmarker_fields: List[DynamicEndmarkerField]):
        """Sets the dynamic_endmarker_fields of this OdxAny.


        :param dynamic_endmarker_fields: The dynamic_endmarker_fields of this OdxAny.
        :type dynamic_endmarker_fields: List[DynamicEndmarkerField]
        """

        self._dynamic_endmarker_fields = dynamic_endmarker_fields

    @property
    def end_of_pdu_fields(self) -> List[EndOfPduField]:
        """Gets the end_of_pdu_fields of this OdxAny.


        :return: The end_of_pdu_fields of this OdxAny.
        :rtype: List[EndOfPduField]
        """
        return self._end_of_pdu_fields

    @end_of_pdu_fields.setter
    def end_of_pdu_fields(self, end_of_pdu_fields: List[EndOfPduField]):
        """Sets the end_of_pdu_fields of this OdxAny.


        :param end_of_pdu_fields: The end_of_pdu_fields of this OdxAny.
        :type end_of_pdu_fields: List[EndOfPduField]
        """

        self._end_of_pdu_fields = end_of_pdu_fields

    @property
    def muxs(self) -> List[Multiplexer]:
        """Gets the muxs of this OdxAny.


        :return: The muxs of this OdxAny.
        :rtype: List[Multiplexer]
        """
        return self._muxs

    @muxs.setter
    def muxs(self, muxs: List[Multiplexer]):
        """Sets the muxs of this OdxAny.


        :param muxs: The muxs of this OdxAny.
        :type muxs: List[Multiplexer]
        """

        self._muxs = muxs

    @property
    def env_datas(self) -> List[EnvironmentData]:
        """Gets the env_datas of this OdxAny.


        :return: The env_datas of this OdxAny.
        :rtype: List[EnvironmentData]
        """
        return self._env_datas

    @env_datas.setter
    def env_datas(self, env_datas: List[EnvironmentData]):
        """Sets the env_datas of this OdxAny.


        :param env_datas: The env_datas of this OdxAny.
        :type env_datas: List[EnvironmentData]
        """

        self._env_datas = env_datas

    @property
    def tables(self) -> List[Table]:
        """Gets the tables of this OdxAny.


        :return: The tables of this OdxAny.
        :rtype: List[Table]
        """
        return self._tables

    @tables.setter
    def tables(self, tables: List[Table]):
        """Sets the tables of this OdxAny.


        :param tables: The tables of this OdxAny.
        :type tables: List[Table]
        """

        self._tables = tables

    @property
    def functional_groups(self) -> List[FunctionalGroup]:
        """Gets the functional_groups of this OdxAny.


        :return: The functional_groups of this OdxAny.
        :rtype: List[FunctionalGroup]
        """
        return self._functional_groups

    @functional_groups.setter
    def functional_groups(self, functional_groups: List[FunctionalGroup]):
        """Sets the functional_groups of this OdxAny.


        :param functional_groups: The functional_groups of this OdxAny.
        :type functional_groups: List[FunctionalGroup]
        """

        self._functional_groups = functional_groups

    @property
    def ecu_shared_datas(self) -> List[EcuSharedData]:
        """Gets the ecu_shared_datas of this OdxAny.


        :return: The ecu_shared_datas of this OdxAny.
        :rtype: List[EcuSharedData]
        """
        return self._ecu_shared_datas

    @ecu_shared_datas.setter
    def ecu_shared_datas(self, ecu_shared_datas: List[EcuSharedData]):
        """Sets the ecu_shared_datas of this OdxAny.


        :param ecu_shared_datas: The ecu_shared_datas of this OdxAny.
        :type ecu_shared_datas: List[EcuSharedData]
        """

        self._ecu_shared_datas = ecu_shared_datas

    @property
    def base_variants(self) -> List[BaseVariant]:
        """Gets the base_variants of this OdxAny.


        :return: The base_variants of this OdxAny.
        :rtype: List[BaseVariant]
        """
        return self._base_variants

    @base_variants.setter
    def base_variants(self, base_variants: List[BaseVariant]):
        """Sets the base_variants of this OdxAny.


        :param base_variants: The base_variants of this OdxAny.
        :type base_variants: List[BaseVariant]
        """

        self._base_variants = base_variants

    @property
    def function_diag_comm_connectors(self) -> List[FunctionDiagCommConnector]:
        """Gets the function_diag_comm_connectors of this OdxAny.


        :return: The function_diag_comm_connectors of this OdxAny.
        :rtype: List[FunctionDiagCommConnector]
        """
        return self._function_diag_comm_connectors

    @function_diag_comm_connectors.setter
    def function_diag_comm_connectors(self, function_diag_comm_connectors: List[FunctionDiagCommConnector]):
        """Sets the function_diag_comm_connectors of this OdxAny.


        :param function_diag_comm_connectors: The function_diag_comm_connectors of this OdxAny.
        :type function_diag_comm_connectors: List[FunctionDiagCommConnector]
        """

        self._function_diag_comm_connectors = function_diag_comm_connectors

    @property
    def table_row_connectors(self) -> List[TableRowConnector]:
        """Gets the table_row_connectors of this OdxAny.


        :return: The table_row_connectors of this OdxAny.
        :rtype: List[TableRowConnector]
        """
        return self._table_row_connectors

    @table_row_connectors.setter
    def table_row_connectors(self, table_row_connectors: List[TableRowConnector]):
        """Sets the table_row_connectors of this OdxAny.


        :param table_row_connectors: The table_row_connectors of this OdxAny.
        :type table_row_connectors: List[TableRowConnector]
        """

        self._table_row_connectors = table_row_connectors

    @property
    def env_data_connectors(self) -> List[EnvDataConnector]:
        """Gets the env_data_connectors of this OdxAny.


        :return: The env_data_connectors of this OdxAny.
        :rtype: List[EnvDataConnector]
        """
        return self._env_data_connectors

    @env_data_connectors.setter
    def env_data_connectors(self, env_data_connectors: List[EnvDataConnector]):
        """Sets the env_data_connectors of this OdxAny.


        :param env_data_connectors: The env_data_connectors of this OdxAny.
        :type env_data_connectors: List[EnvDataConnector]
        """

        self._env_data_connectors = env_data_connectors

    @property
    def dtc_connectors(self) -> List[DtcConnector]:
        """Gets the dtc_connectors of this OdxAny.


        :return: The dtc_connectors of this OdxAny.
        :rtype: List[DtcConnector]
        """
        return self._dtc_connectors

    @dtc_connectors.setter
    def dtc_connectors(self, dtc_connectors: List[DtcConnector]):
        """Sets the dtc_connectors of this OdxAny.


        :param dtc_connectors: The dtc_connectors of this OdxAny.
        :type dtc_connectors: List[DtcConnector]
        """

        self._dtc_connectors = dtc_connectors

    @property
    def request_ref(self) -> OdxLinkRef:
        """Gets the request_ref of this OdxAny.


        :return: The request_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._request_ref

    @request_ref.setter
    def request_ref(self, request_ref: OdxLinkRef):
        """Sets the request_ref of this OdxAny.


        :param request_ref: The request_ref of this OdxAny.
        :type request_ref: OdxLinkRef
        """

        self._request_ref = request_ref

    @property
    def pos_response_refs(self) -> List[OdxLinkRef]:
        """Gets the pos_response_refs of this OdxAny.


        :return: The pos_response_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._pos_response_refs

    @pos_response_refs.setter
    def pos_response_refs(self, pos_response_refs: List[OdxLinkRef]):
        """Sets the pos_response_refs of this OdxAny.


        :param pos_response_refs: The pos_response_refs of this OdxAny.
        :type pos_response_refs: List[OdxLinkRef]
        """

        self._pos_response_refs = pos_response_refs

    @property
    def neg_response_refs(self) -> List[OdxLinkRef]:
        """Gets the neg_response_refs of this OdxAny.


        :return: The neg_response_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._neg_response_refs

    @neg_response_refs.setter
    def neg_response_refs(self, neg_response_refs: List[OdxLinkRef]):
        """Sets the neg_response_refs of this OdxAny.


        :param neg_response_refs: The neg_response_refs of this OdxAny.
        :type neg_response_refs: List[OdxLinkRef]
        """

        self._neg_response_refs = neg_response_refs

    @property
    def pos_response_suppressible(self) -> PosResponseSuppressible:
        """Gets the pos_response_suppressible of this OdxAny.


        :return: The pos_response_suppressible of this OdxAny.
        :rtype: PosResponseSuppressible
        """
        return self._pos_response_suppressible

    @pos_response_suppressible.setter
    def pos_response_suppressible(self, pos_response_suppressible: PosResponseSuppressible):
        """Sets the pos_response_suppressible of this OdxAny.


        :param pos_response_suppressible: The pos_response_suppressible of this OdxAny.
        :type pos_response_suppressible: PosResponseSuppressible
        """

        self._pos_response_suppressible = pos_response_suppressible

    @property
    def is_cyclic_raw(self) -> bool:
        """Gets the is_cyclic_raw of this OdxAny.


        :return: The is_cyclic_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_cyclic_raw

    @is_cyclic_raw.setter
    def is_cyclic_raw(self, is_cyclic_raw: bool):
        """Sets the is_cyclic_raw of this OdxAny.


        :param is_cyclic_raw: The is_cyclic_raw of this OdxAny.
        :type is_cyclic_raw: bool
        """

        self._is_cyclic_raw = is_cyclic_raw

    @property
    def is_cyclic(self) -> bool:
        """Gets the is_cyclic of this OdxAny.


        :return: The is_cyclic of this OdxAny.
        :rtype: bool
        """
        return self._is_cyclic

    @is_cyclic.setter
    def is_cyclic(self, is_cyclic: bool):
        """Sets the is_cyclic of this OdxAny.


        :param is_cyclic: The is_cyclic of this OdxAny.
        :type is_cyclic: bool
        """

        self._is_cyclic = is_cyclic

    @property
    def is_multiple_raw(self) -> bool:
        """Gets the is_multiple_raw of this OdxAny.


        :return: The is_multiple_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_multiple_raw

    @is_multiple_raw.setter
    def is_multiple_raw(self, is_multiple_raw: bool):
        """Sets the is_multiple_raw of this OdxAny.


        :param is_multiple_raw: The is_multiple_raw of this OdxAny.
        :type is_multiple_raw: bool
        """

        self._is_multiple_raw = is_multiple_raw

    @property
    def is_multiple(self) -> bool:
        """Gets the is_multiple of this OdxAny.


        :return: The is_multiple of this OdxAny.
        :rtype: bool
        """
        return self._is_multiple

    @is_multiple.setter
    def is_multiple(self, is_multiple: bool):
        """Sets the is_multiple of this OdxAny.


        :param is_multiple: The is_multiple of this OdxAny.
        :type is_multiple: bool
        """

        self._is_multiple = is_multiple

    @property
    def addressing_raw(self) -> Addressing:
        """Gets the addressing_raw of this OdxAny.


        :return: The addressing_raw of this OdxAny.
        :rtype: Addressing
        """
        return self._addressing_raw

    @addressing_raw.setter
    def addressing_raw(self, addressing_raw: Addressing):
        """Sets the addressing_raw of this OdxAny.


        :param addressing_raw: The addressing_raw of this OdxAny.
        :type addressing_raw: Addressing
        """

        self._addressing_raw = addressing_raw

    @property
    def addressing(self) -> Addressing:
        """Gets the addressing of this OdxAny.


        :return: The addressing of this OdxAny.
        :rtype: Addressing
        """
        return self._addressing

    @addressing.setter
    def addressing(self, addressing: Addressing):
        """Sets the addressing of this OdxAny.


        :param addressing: The addressing of this OdxAny.
        :type addressing: Addressing
        """

        self._addressing = addressing

    @property
    def transmission_mode_raw(self) -> TransMode:
        """Gets the transmission_mode_raw of this OdxAny.


        :return: The transmission_mode_raw of this OdxAny.
        :rtype: TransMode
        """
        return self._transmission_mode_raw

    @transmission_mode_raw.setter
    def transmission_mode_raw(self, transmission_mode_raw: TransMode):
        """Sets the transmission_mode_raw of this OdxAny.


        :param transmission_mode_raw: The transmission_mode_raw of this OdxAny.
        :type transmission_mode_raw: TransMode
        """

        self._transmission_mode_raw = transmission_mode_raw

    @property
    def transmission_mode(self) -> TransMode:
        """Gets the transmission_mode of this OdxAny.


        :return: The transmission_mode of this OdxAny.
        :rtype: TransMode
        """
        return self._transmission_mode

    @transmission_mode.setter
    def transmission_mode(self, transmission_mode: TransMode):
        """Sets the transmission_mode of this OdxAny.


        :param transmission_mode: The transmission_mode of this OdxAny.
        :type transmission_mode: TransMode
        """

        self._transmission_mode = transmission_mode

    @property
    def request(self) -> Request:
        """Gets the request of this OdxAny.


        :return: The request of this OdxAny.
        :rtype: Request
        """
        return self._request

    @request.setter
    def request(self, request: Request):
        """Sets the request of this OdxAny.


        :param request: The request of this OdxAny.
        :type request: Request
        """

        self._request = request

    @property
    def variable_group_ref(self) -> OdxLinkRef:
        """Gets the variable_group_ref of this OdxAny.


        :return: The variable_group_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._variable_group_ref

    @variable_group_ref.setter
    def variable_group_ref(self, variable_group_ref: OdxLinkRef):
        """Sets the variable_group_ref of this OdxAny.


        :param variable_group_ref: The variable_group_ref of this OdxAny.
        :type variable_group_ref: OdxLinkRef
        """

        self._variable_group_ref = variable_group_ref

    @property
    def sw_variables(self) -> List[SwVariable]:
        """Gets the sw_variables of this OdxAny.


        :return: The sw_variables of this OdxAny.
        :rtype: List[SwVariable]
        """
        return self._sw_variables

    @sw_variables.setter
    def sw_variables(self, sw_variables: List[SwVariable]):
        """Sets the sw_variables of this OdxAny.


        :param sw_variables: The sw_variables of this OdxAny.
        :type sw_variables: List[SwVariable]
        """

        self._sw_variables = sw_variables

    @property
    def comm_relations(self) -> List[CommRelation]:
        """Gets the comm_relations of this OdxAny.


        :return: The comm_relations of this OdxAny.
        :rtype: List[CommRelation]
        """
        return self._comm_relations

    @comm_relations.setter
    def comm_relations(self, comm_relations: List[CommRelation]):
        """Sets the comm_relations of this OdxAny.


        :param comm_relations: The comm_relations of this OdxAny.
        :type comm_relations: List[CommRelation]
        """

        self._comm_relations = comm_relations

    @property
    def table_snref(self) -> str:
        """Gets the table_snref of this OdxAny.


        :return: The table_snref of this OdxAny.
        :rtype: str
        """
        return self._table_snref

    @table_snref.setter
    def table_snref(self, table_snref: str):
        """Sets the table_snref of this OdxAny.


        :param table_snref: The table_snref of this OdxAny.
        :type table_snref: str
        """

        self._table_snref = table_snref

    @property
    def table_row_snref(self) -> str:
        """Gets the table_row_snref of this OdxAny.


        :return: The table_row_snref of this OdxAny.
        :rtype: str
        """
        return self._table_row_snref

    @table_row_snref.setter
    def table_row_snref(self, table_row_snref: str):
        """Sets the table_row_snref of this OdxAny.


        :param table_row_snref: The table_row_snref of this OdxAny.
        :type table_row_snref: str
        """

        self._table_row_snref = table_row_snref

    @property
    def is_read_before_write_raw(self) -> bool:
        """Gets the is_read_before_write_raw of this OdxAny.


        :return: The is_read_before_write_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_read_before_write_raw

    @is_read_before_write_raw.setter
    def is_read_before_write_raw(self, is_read_before_write_raw: bool):
        """Sets the is_read_before_write_raw of this OdxAny.


        :param is_read_before_write_raw: The is_read_before_write_raw of this OdxAny.
        :type is_read_before_write_raw: bool
        """

        self._is_read_before_write_raw = is_read_before_write_raw

    @property
    def is_read_before_write(self) -> bool:
        """Gets the is_read_before_write of this OdxAny.


        :return: The is_read_before_write of this OdxAny.
        :rtype: bool
        """
        return self._is_read_before_write

    @is_read_before_write.setter
    def is_read_before_write(self, is_read_before_write: bool):
        """Sets the is_read_before_write of this OdxAny.


        :param is_read_before_write: The is_read_before_write of this OdxAny.
        :type is_read_before_write: bool
        """

        self._is_read_before_write = is_read_before_write

    @property
    def variable_group(self) -> VariableGroup:
        """Gets the variable_group of this OdxAny.


        :return: The variable_group of this OdxAny.
        :rtype: VariableGroup
        """
        return self._variable_group

    @variable_group.setter
    def variable_group(self, variable_group: VariableGroup):
        """Sets the variable_group of this OdxAny.


        :param variable_group: The variable_group of this OdxAny.
        :type variable_group: VariableGroup
        """

        self._variable_group = variable_group

    @property
    def table(self) -> TableResolved:
        """Gets the table of this OdxAny.


        :return: The table of this OdxAny.
        :rtype: TableResolved
        """
        return self._table

    @table.setter
    def table(self, table: TableResolved):
        """Sets the table of this OdxAny.


        :param table: The table of this OdxAny.
        :type table: TableResolved
        """

        self._table = table

    @property
    def table_row(self) -> TableRowResolved:
        """Gets the table_row of this OdxAny.


        :return: The table_row of this OdxAny.
        :rtype: TableRowResolved
        """
        return self._table_row

    @table_row.setter
    def table_row(self, table_row: TableRowResolved):
        """Sets the table_row of this OdxAny.


        :param table_row: The table_row of this OdxAny.
        :type table_row: TableRowResolved
        """

        self._table_row = table_row

    @property
    def trouble_code(self) -> int:
        """Gets the trouble_code of this OdxAny.


        :return: The trouble_code of this OdxAny.
        :rtype: int
        """
        return self._trouble_code

    @trouble_code.setter
    def trouble_code(self, trouble_code: int):
        """Sets the trouble_code of this OdxAny.


        :param trouble_code: The trouble_code of this OdxAny.
        :type trouble_code: int
        """

        self._trouble_code = trouble_code

    @property
    def display_trouble_code(self) -> str:
        """Gets the display_trouble_code of this OdxAny.


        :return: The display_trouble_code of this OdxAny.
        :rtype: str
        """
        return self._display_trouble_code

    @display_trouble_code.setter
    def display_trouble_code(self, display_trouble_code: str):
        """Sets the display_trouble_code of this OdxAny.


        :param display_trouble_code: The display_trouble_code of this OdxAny.
        :type display_trouble_code: str
        """

        self._display_trouble_code = display_trouble_code

    @property
    def level(self) -> int:
        """Gets the level of this OdxAny.


        :return: The level of this OdxAny.
        :rtype: int
        """
        return self._level

    @level.setter
    def level(self, level: int):
        """Sets the level of this OdxAny.


        :param level: The level of this OdxAny.
        :type level: int
        """

        self._level = level

    @property
    def is_temporary_raw(self) -> bool:
        """Gets the is_temporary_raw of this OdxAny.


        :return: The is_temporary_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_temporary_raw

    @is_temporary_raw.setter
    def is_temporary_raw(self, is_temporary_raw: bool):
        """Sets the is_temporary_raw of this OdxAny.


        :param is_temporary_raw: The is_temporary_raw of this OdxAny.
        :type is_temporary_raw: bool
        """

        self._is_temporary_raw = is_temporary_raw

    @property
    def is_temporary(self) -> bool:
        """Gets the is_temporary of this OdxAny.


        :return: The is_temporary of this OdxAny.
        :rtype: bool
        """
        return self._is_temporary

    @is_temporary.setter
    def is_temporary(self, is_temporary: bool):
        """Sets the is_temporary of this OdxAny.


        :param is_temporary: The is_temporary of this OdxAny.
        :type is_temporary: bool
        """

        self._is_temporary = is_temporary

    @property
    def _date(self) -> str:
        """Gets the _date of this OdxAny.


        :return: The _date of this OdxAny.
        :rtype: str
        """
        return self.__date

    @_date.setter
    def _date(self, _date: str):
        """Sets the _date of this OdxAny.


        :param _date: The _date of this OdxAny.
        :type _date: str
        """

        self.__date = _date

    @property
    def tool(self) -> str:
        """Gets the tool of this OdxAny.


        :return: The tool of this OdxAny.
        :rtype: str
        """
        return self._tool

    @tool.setter
    def tool(self, tool: str):
        """Sets the tool of this OdxAny.


        :param tool: The tool of this OdxAny.
        :type tool: str
        """

        self._tool = tool

    @property
    def company_revision_infos(self) -> List[CompanyRevisionInfo]:
        """Gets the company_revision_infos of this OdxAny.


        :return: The company_revision_infos of this OdxAny.
        :rtype: List[CompanyRevisionInfo]
        """
        return self._company_revision_infos

    @company_revision_infos.setter
    def company_revision_infos(self, company_revision_infos: List[CompanyRevisionInfo]):
        """Sets the company_revision_infos of this OdxAny.


        :param company_revision_infos: The company_revision_infos of this OdxAny.
        :type company_revision_infos: List[CompanyRevisionInfo]
        """

        self._company_revision_infos = company_revision_infos

    @property
    def modifications(self) -> List[Modification]:
        """Gets the modifications of this OdxAny.


        :return: The modifications of this OdxAny.
        :rtype: List[Modification]
        """
        return self._modifications

    @modifications.setter
    def modifications(self, modifications: List[Modification]):
        """Sets the modifications of this OdxAny.


        :param modifications: The modifications of this OdxAny.
        :type modifications: List[Modification]
        """

        self._modifications = modifications

    @property
    def dtc_dop_ref(self) -> OdxLinkRef:
        """Gets the dtc_dop_ref of this OdxAny.


        :return: The dtc_dop_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._dtc_dop_ref

    @dtc_dop_ref.setter
    def dtc_dop_ref(self, dtc_dop_ref: OdxLinkRef):
        """Sets the dtc_dop_ref of this OdxAny.


        :param dtc_dop_ref: The dtc_dop_ref of this OdxAny.
        :type dtc_dop_ref: OdxLinkRef
        """

        self._dtc_dop_ref = dtc_dop_ref

    @property
    def dtc_snref(self) -> str:
        """Gets the dtc_snref of this OdxAny.


        :return: The dtc_snref of this OdxAny.
        :rtype: str
        """
        return self._dtc_snref

    @dtc_snref.setter
    def dtc_snref(self, dtc_snref: str):
        """Sets the dtc_snref of this OdxAny.


        :param dtc_snref: The dtc_snref of this OdxAny.
        :type dtc_snref: str
        """

        self._dtc_snref = dtc_snref

    @property
    def dtc_dop(self) -> DtcDop:
        """Gets the dtc_dop of this OdxAny.


        :return: The dtc_dop of this OdxAny.
        :rtype: DtcDop
        """
        return self._dtc_dop

    @dtc_dop.setter
    def dtc_dop(self, dtc_dop: DtcDop):
        """Sets the dtc_dop of this OdxAny.


        :param dtc_dop: The dtc_dop of this OdxAny.
        :type dtc_dop: DtcDop
        """

        self._dtc_dop = dtc_dop

    @property
    def dtc(self) -> DiagnosticTroubleCode:
        """Gets the dtc of this OdxAny.


        :return: The dtc of this OdxAny.
        :rtype: DiagnosticTroubleCode
        """
        return self._dtc

    @dtc.setter
    def dtc(self, dtc: DiagnosticTroubleCode):
        """Sets the dtc of this OdxAny.


        :param dtc: The dtc of this OdxAny.
        :type dtc: DiagnosticTroubleCode
        """

        self._dtc = dtc

    @property
    def dtcs_raw(self) -> List[DtcDopDtcsRawInner]:
        """Gets the dtcs_raw of this OdxAny.


        :return: The dtcs_raw of this OdxAny.
        :rtype: List[DtcDopDtcsRawInner]
        """
        return self._dtcs_raw

    @dtcs_raw.setter
    def dtcs_raw(self, dtcs_raw: List[DtcDopDtcsRawInner]):
        """Sets the dtcs_raw of this OdxAny.


        :param dtcs_raw: The dtcs_raw of this OdxAny.
        :type dtcs_raw: List[DtcDopDtcsRawInner]
        """

        self._dtcs_raw = dtcs_raw

    @property
    def dtcs(self) -> List[DiagnosticTroubleCode]:
        """Gets the dtcs of this OdxAny.


        :return: The dtcs of this OdxAny.
        :rtype: List[DiagnosticTroubleCode]
        """
        return self._dtcs

    @dtcs.setter
    def dtcs(self, dtcs: List[DiagnosticTroubleCode]):
        """Sets the dtcs of this OdxAny.


        :param dtcs: The dtcs of this OdxAny.
        :type dtcs: List[DiagnosticTroubleCode]
        """

        self._dtcs = dtcs

    @property
    def linked_dtc_dops_raw(self) -> List[LinkedDtcDop]:
        """Gets the linked_dtc_dops_raw of this OdxAny.


        :return: The linked_dtc_dops_raw of this OdxAny.
        :rtype: List[LinkedDtcDop]
        """
        return self._linked_dtc_dops_raw

    @linked_dtc_dops_raw.setter
    def linked_dtc_dops_raw(self, linked_dtc_dops_raw: List[LinkedDtcDop]):
        """Sets the linked_dtc_dops_raw of this OdxAny.


        :param linked_dtc_dops_raw: The linked_dtc_dops_raw of this OdxAny.
        :type linked_dtc_dops_raw: List[LinkedDtcDop]
        """

        self._linked_dtc_dops_raw = linked_dtc_dops_raw

    @property
    def linked_dtc_dops(self) -> List[LinkedDtcDop]:
        """Gets the linked_dtc_dops of this OdxAny.


        :return: The linked_dtc_dops of this OdxAny.
        :rtype: List[LinkedDtcDop]
        """
        return self._linked_dtc_dops

    @linked_dtc_dops.setter
    def linked_dtc_dops(self, linked_dtc_dops: List[LinkedDtcDop]):
        """Sets the linked_dtc_dops of this OdxAny.


        :param linked_dtc_dops: The linked_dtc_dops of this OdxAny.
        :type linked_dtc_dops: List[LinkedDtcDop]
        """

        self._linked_dtc_dops = linked_dtc_dops

    @property
    def is_visible_raw(self) -> bool:
        """Gets the is_visible_raw of this OdxAny.


        :return: The is_visible_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_visible_raw

    @is_visible_raw.setter
    def is_visible_raw(self, is_visible_raw: bool):
        """Sets the is_visible_raw of this OdxAny.


        :param is_visible_raw: The is_visible_raw of this OdxAny.
        :type is_visible_raw: bool
        """

        self._is_visible_raw = is_visible_raw

    @property
    def is_visible(self) -> bool:
        """Gets the is_visible of this OdxAny.


        :return: The is_visible of this OdxAny.
        :rtype: bool
        """
        return self._is_visible

    @is_visible.setter
    def is_visible(self, is_visible: bool):
        """Sets the is_visible of this OdxAny.


        :param is_visible: The is_visible of this OdxAny.
        :type is_visible: bool
        """

        self._is_visible = is_visible

    @property
    def dyn_id_def_mode_infos(self) -> List[DynIdDefModeInfo]:
        """Gets the dyn_id_def_mode_infos of this OdxAny.


        :return: The dyn_id_def_mode_infos of this OdxAny.
        :rtype: List[DynIdDefModeInfo]
        """
        return self._dyn_id_def_mode_infos

    @dyn_id_def_mode_infos.setter
    def dyn_id_def_mode_infos(self, dyn_id_def_mode_infos: List[DynIdDefModeInfo]):
        """Sets the dyn_id_def_mode_infos of this OdxAny.


        :param dyn_id_def_mode_infos: The dyn_id_def_mode_infos of this OdxAny.
        :type dyn_id_def_mode_infos: List[DynIdDefModeInfo]
        """

        self._dyn_id_def_mode_infos = dyn_id_def_mode_infos

    @property
    def ref_id(self) -> str:
        """Gets the ref_id of this OdxAny.


        :return: The ref_id of this OdxAny.
        :rtype: str
        """
        return self._ref_id

    @ref_id.setter
    def ref_id(self, ref_id: str):
        """Sets the ref_id of this OdxAny.


        :param ref_id: The ref_id of this OdxAny.
        :type ref_id: str
        """

        self._ref_id = ref_id

    @property
    def ref_docs(self) -> List[OdxDocFragment]:
        """Gets the ref_docs of this OdxAny.


        :return: The ref_docs of this OdxAny.
        :rtype: List[OdxDocFragment]
        """
        return self._ref_docs

    @ref_docs.setter
    def ref_docs(self, ref_docs: List[OdxDocFragment]):
        """Sets the ref_docs of this OdxAny.


        :param ref_docs: The ref_docs of this OdxAny.
        :type ref_docs: List[OdxDocFragment]
        """

        self._ref_docs = ref_docs

    @property
    def termination_value_raw(self) -> str:
        """Gets the termination_value_raw of this OdxAny.


        :return: The termination_value_raw of this OdxAny.
        :rtype: str
        """
        return self._termination_value_raw

    @termination_value_raw.setter
    def termination_value_raw(self, termination_value_raw: str):
        """Sets the termination_value_raw of this OdxAny.


        :param termination_value_raw: The termination_value_raw of this OdxAny.
        :type termination_value_raw: str
        """

        self._termination_value_raw = termination_value_raw

    @property
    def resolved_object_perma_id(self) -> str:
        """Gets the resolved_object_perma_id of this OdxAny.


        :return: The resolved_object_perma_id of this OdxAny.
        :rtype: str
        """
        return self._resolved_object_perma_id

    @resolved_object_perma_id.setter
    def resolved_object_perma_id(self, resolved_object_perma_id: str):
        """Sets the resolved_object_perma_id of this OdxAny.


        :param resolved_object_perma_id: The resolved_object_perma_id of this OdxAny.
        :type resolved_object_perma_id: str
        """

        self._resolved_object_perma_id = resolved_object_perma_id

    @property
    def resolved_object_ephemeral_id(self) -> int:
        """Gets the resolved_object_ephemeral_id of this OdxAny.


        :return: The resolved_object_ephemeral_id of this OdxAny.
        :rtype: int
        """
        return self._resolved_object_ephemeral_id

    @resolved_object_ephemeral_id.setter
    def resolved_object_ephemeral_id(self, resolved_object_ephemeral_id: int):
        """Sets the resolved_object_ephemeral_id of this OdxAny.


        :param resolved_object_ephemeral_id: The resolved_object_ephemeral_id of this OdxAny.
        :type resolved_object_ephemeral_id: int
        """

        self._resolved_object_ephemeral_id = resolved_object_ephemeral_id

    @property
    def resolved_object_short_name(self) -> str:
        """Gets the resolved_object_short_name of this OdxAny.


        :return: The resolved_object_short_name of this OdxAny.
        :rtype: str
        """
        return self._resolved_object_short_name

    @resolved_object_short_name.setter
    def resolved_object_short_name(self, resolved_object_short_name: str):
        """Sets the resolved_object_short_name of this OdxAny.


        :param resolved_object_short_name: The resolved_object_short_name of this OdxAny.
        :type resolved_object_short_name: str
        """

        self._resolved_object_short_name = resolved_object_short_name

    @property
    def def_mode(self) -> str:
        """Gets the def_mode of this OdxAny.


        :return: The def_mode of this OdxAny.
        :rtype: str
        """
        return self._def_mode

    @def_mode.setter
    def def_mode(self, def_mode: str):
        """Sets the def_mode of this OdxAny.


        :param def_mode: The def_mode of this OdxAny.
        :type def_mode: str
        """

        self._def_mode = def_mode

    @property
    def clear_dyn_def_message_ref(self) -> OdxLinkRef:
        """Gets the clear_dyn_def_message_ref of this OdxAny.


        :return: The clear_dyn_def_message_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._clear_dyn_def_message_ref

    @clear_dyn_def_message_ref.setter
    def clear_dyn_def_message_ref(self, clear_dyn_def_message_ref: OdxLinkRef):
        """Sets the clear_dyn_def_message_ref of this OdxAny.


        :param clear_dyn_def_message_ref: The clear_dyn_def_message_ref of this OdxAny.
        :type clear_dyn_def_message_ref: OdxLinkRef
        """

        self._clear_dyn_def_message_ref = clear_dyn_def_message_ref

    @property
    def clear_dyn_def_message_snref(self) -> str:
        """Gets the clear_dyn_def_message_snref of this OdxAny.


        :return: The clear_dyn_def_message_snref of this OdxAny.
        :rtype: str
        """
        return self._clear_dyn_def_message_snref

    @clear_dyn_def_message_snref.setter
    def clear_dyn_def_message_snref(self, clear_dyn_def_message_snref: str):
        """Sets the clear_dyn_def_message_snref of this OdxAny.


        :param clear_dyn_def_message_snref: The clear_dyn_def_message_snref of this OdxAny.
        :type clear_dyn_def_message_snref: str
        """

        self._clear_dyn_def_message_snref = clear_dyn_def_message_snref

    @property
    def read_dyn_def_message_ref(self) -> OdxLinkRef:
        """Gets the read_dyn_def_message_ref of this OdxAny.


        :return: The read_dyn_def_message_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._read_dyn_def_message_ref

    @read_dyn_def_message_ref.setter
    def read_dyn_def_message_ref(self, read_dyn_def_message_ref: OdxLinkRef):
        """Sets the read_dyn_def_message_ref of this OdxAny.


        :param read_dyn_def_message_ref: The read_dyn_def_message_ref of this OdxAny.
        :type read_dyn_def_message_ref: OdxLinkRef
        """

        self._read_dyn_def_message_ref = read_dyn_def_message_ref

    @property
    def read_dyn_def_message_snref(self) -> str:
        """Gets the read_dyn_def_message_snref of this OdxAny.


        :return: The read_dyn_def_message_snref of this OdxAny.
        :rtype: str
        """
        return self._read_dyn_def_message_snref

    @read_dyn_def_message_snref.setter
    def read_dyn_def_message_snref(self, read_dyn_def_message_snref: str):
        """Sets the read_dyn_def_message_snref of this OdxAny.


        :param read_dyn_def_message_snref: The read_dyn_def_message_snref of this OdxAny.
        :type read_dyn_def_message_snref: str
        """

        self._read_dyn_def_message_snref = read_dyn_def_message_snref

    @property
    def dyn_def_message_ref(self) -> OdxLinkRef:
        """Gets the dyn_def_message_ref of this OdxAny.


        :return: The dyn_def_message_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._dyn_def_message_ref

    @dyn_def_message_ref.setter
    def dyn_def_message_ref(self, dyn_def_message_ref: OdxLinkRef):
        """Sets the dyn_def_message_ref of this OdxAny.


        :param dyn_def_message_ref: The dyn_def_message_ref of this OdxAny.
        :type dyn_def_message_ref: OdxLinkRef
        """

        self._dyn_def_message_ref = dyn_def_message_ref

    @property
    def dyn_def_message_snref(self) -> str:
        """Gets the dyn_def_message_snref of this OdxAny.


        :return: The dyn_def_message_snref of this OdxAny.
        :rtype: str
        """
        return self._dyn_def_message_snref

    @dyn_def_message_snref.setter
    def dyn_def_message_snref(self, dyn_def_message_snref: str):
        """Sets the dyn_def_message_snref of this OdxAny.


        :param dyn_def_message_snref: The dyn_def_message_snref of this OdxAny.
        :type dyn_def_message_snref: str
        """

        self._dyn_def_message_snref = dyn_def_message_snref

    @property
    def supported_dyn_ids(self) -> List[str]:
        """Gets the supported_dyn_ids of this OdxAny.


        :return: The supported_dyn_ids of this OdxAny.
        :rtype: List[str]
        """
        return self._supported_dyn_ids

    @supported_dyn_ids.setter
    def supported_dyn_ids(self, supported_dyn_ids: List[str]):
        """Sets the supported_dyn_ids of this OdxAny.


        :param supported_dyn_ids: The supported_dyn_ids of this OdxAny.
        :type supported_dyn_ids: List[str]
        """

        self._supported_dyn_ids = supported_dyn_ids

    @property
    def selection_table_refs(self) -> List[DynIdDefModeInfoSelectionTableRefsInner]:
        """Gets the selection_table_refs of this OdxAny.


        :return: The selection_table_refs of this OdxAny.
        :rtype: List[DynIdDefModeInfoSelectionTableRefsInner]
        """
        return self._selection_table_refs

    @selection_table_refs.setter
    def selection_table_refs(self, selection_table_refs: List[DynIdDefModeInfoSelectionTableRefsInner]):
        """Sets the selection_table_refs of this OdxAny.


        :param selection_table_refs: The selection_table_refs of this OdxAny.
        :type selection_table_refs: List[DynIdDefModeInfoSelectionTableRefsInner]
        """

        self._selection_table_refs = selection_table_refs

    @property
    def clear_dyn_def_message(self) -> DiagCommResolved:
        """Gets the clear_dyn_def_message of this OdxAny.


        :return: The clear_dyn_def_message of this OdxAny.
        :rtype: DiagCommResolved
        """
        return self._clear_dyn_def_message

    @clear_dyn_def_message.setter
    def clear_dyn_def_message(self, clear_dyn_def_message: DiagCommResolved):
        """Sets the clear_dyn_def_message of this OdxAny.


        :param clear_dyn_def_message: The clear_dyn_def_message of this OdxAny.
        :type clear_dyn_def_message: DiagCommResolved
        """

        self._clear_dyn_def_message = clear_dyn_def_message

    @property
    def read_dyn_def_message(self) -> DiagCommResolved:
        """Gets the read_dyn_def_message of this OdxAny.


        :return: The read_dyn_def_message of this OdxAny.
        :rtype: DiagCommResolved
        """
        return self._read_dyn_def_message

    @read_dyn_def_message.setter
    def read_dyn_def_message(self, read_dyn_def_message: DiagCommResolved):
        """Sets the read_dyn_def_message of this OdxAny.


        :param read_dyn_def_message: The read_dyn_def_message of this OdxAny.
        :type read_dyn_def_message: DiagCommResolved
        """

        self._read_dyn_def_message = read_dyn_def_message

    @property
    def dyn_def_message(self) -> DiagCommResolved:
        """Gets the dyn_def_message of this OdxAny.


        :return: The dyn_def_message of this OdxAny.
        :rtype: DiagCommResolved
        """
        return self._dyn_def_message

    @dyn_def_message.setter
    def dyn_def_message(self, dyn_def_message: DiagCommResolved):
        """Sets the dyn_def_message of this OdxAny.


        :param dyn_def_message: The dyn_def_message of this OdxAny.
        :type dyn_def_message: DiagCommResolved
        """

        self._dyn_def_message = dyn_def_message

    @property
    def selection_tables(self) -> List[Table]:
        """Gets the selection_tables of this OdxAny.


        :return: The selection_tables of this OdxAny.
        :rtype: List[Table]
        """
        return self._selection_tables

    @selection_tables.setter
    def selection_tables(self, selection_tables: List[Table]):
        """Sets the selection_tables of this OdxAny.


        :param selection_tables: The selection_tables of this OdxAny.
        :type selection_tables: List[Table]
        """

        self._selection_tables = selection_tables

    @property
    def structure_ref(self) -> OdxLinkRef:
        """Gets the structure_ref of this OdxAny.


        :return: The structure_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._structure_ref

    @structure_ref.setter
    def structure_ref(self, structure_ref: OdxLinkRef):
        """Sets the structure_ref of this OdxAny.


        :param structure_ref: The structure_ref of this OdxAny.
        :type structure_ref: OdxLinkRef
        """

        self._structure_ref = structure_ref

    @property
    def structure_snref(self) -> str:
        """Gets the structure_snref of this OdxAny.


        :return: The structure_snref of this OdxAny.
        :rtype: str
        """
        return self._structure_snref

    @structure_snref.setter
    def structure_snref(self, structure_snref: str):
        """Sets the structure_snref of this OdxAny.


        :param structure_snref: The structure_snref of this OdxAny.
        :type structure_snref: str
        """

        self._structure_snref = structure_snref

    @property
    def env_data_desc_ref(self) -> OdxLinkRef:
        """Gets the env_data_desc_ref of this OdxAny.


        :return: The env_data_desc_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._env_data_desc_ref

    @env_data_desc_ref.setter
    def env_data_desc_ref(self, env_data_desc_ref: OdxLinkRef):
        """Sets the env_data_desc_ref of this OdxAny.


        :param env_data_desc_ref: The env_data_desc_ref of this OdxAny.
        :type env_data_desc_ref: OdxLinkRef
        """

        self._env_data_desc_ref = env_data_desc_ref

    @property
    def env_data_desc_snref(self) -> str:
        """Gets the env_data_desc_snref of this OdxAny.


        :return: The env_data_desc_snref of this OdxAny.
        :rtype: str
        """
        return self._env_data_desc_snref

    @env_data_desc_snref.setter
    def env_data_desc_snref(self, env_data_desc_snref: str):
        """Sets the env_data_desc_snref of this OdxAny.


        :param env_data_desc_snref: The env_data_desc_snref of this OdxAny.
        :type env_data_desc_snref: str
        """

        self._env_data_desc_snref = env_data_desc_snref

    @property
    def dyn_end_dop_ref(self) -> DynEndDopRef:
        """Gets the dyn_end_dop_ref of this OdxAny.


        :return: The dyn_end_dop_ref of this OdxAny.
        :rtype: DynEndDopRef
        """
        return self._dyn_end_dop_ref

    @dyn_end_dop_ref.setter
    def dyn_end_dop_ref(self, dyn_end_dop_ref: DynEndDopRef):
        """Sets the dyn_end_dop_ref of this OdxAny.


        :param dyn_end_dop_ref: The dyn_end_dop_ref of this OdxAny.
        :type dyn_end_dop_ref: DynEndDopRef
        """

        self._dyn_end_dop_ref = dyn_end_dop_ref

    @property
    def structure(self) -> Structure:
        """Gets the structure of this OdxAny.


        :return: The structure of this OdxAny.
        :rtype: Structure
        """
        return self._structure

    @structure.setter
    def structure(self, structure: Structure):
        """Sets the structure of this OdxAny.


        :param structure: The structure of this OdxAny.
        :type structure: Structure
        """

        self._structure = structure

    @property
    def dyn_end_dop(self) -> DataObjectPropertyResolved:
        """Gets the dyn_end_dop of this OdxAny.


        :return: The dyn_end_dop of this OdxAny.
        :rtype: DataObjectPropertyResolved
        """
        return self._dyn_end_dop

    @dyn_end_dop.setter
    def dyn_end_dop(self, dyn_end_dop: DataObjectPropertyResolved):
        """Sets the dyn_end_dop of this OdxAny.


        :param dyn_end_dop: The dyn_end_dop of this OdxAny.
        :type dyn_end_dop: DataObjectPropertyResolved
        """

        self._dyn_end_dop = dyn_end_dop

    @property
    def offset(self) -> float:
        """Gets the offset of this OdxAny.


        :return: The offset of this OdxAny.
        :rtype: float
        """
        return self._offset

    @offset.setter
    def offset(self, offset: float):
        """Sets the offset of this OdxAny.


        :param offset: The offset of this OdxAny.
        :type offset: float
        """

        self._offset = offset

    @property
    def determine_number_of_items(self) -> DetermineNumberOfItems:
        """Gets the determine_number_of_items of this OdxAny.


        :return: The determine_number_of_items of this OdxAny.
        :rtype: DetermineNumberOfItems
        """
        return self._determine_number_of_items

    @determine_number_of_items.setter
    def determine_number_of_items(self, determine_number_of_items: DetermineNumberOfItems):
        """Sets the determine_number_of_items of this OdxAny.


        :param determine_number_of_items: The determine_number_of_items of this OdxAny.
        :type determine_number_of_items: DetermineNumberOfItems
        """

        self._determine_number_of_items = determine_number_of_items

    @property
    def config_datas(self) -> List[ConfigData]:
        """Gets the config_datas of this OdxAny.


        :return: The config_datas of this OdxAny.
        :rtype: List[ConfigData]
        """
        return self._config_datas

    @config_datas.setter
    def config_datas(self, config_datas: List[ConfigData]):
        """Sets the config_datas of this OdxAny.


        :param config_datas: The config_datas of this OdxAny.
        :type config_datas: List[ConfigData]
        """

        self._config_datas = config_datas

    @property
    def config_data_dictionary_spec(self) -> ConfigDataDictionarySpec:
        """Gets the config_data_dictionary_spec of this OdxAny.


        :return: The config_data_dictionary_spec of this OdxAny.
        :rtype: ConfigDataDictionarySpec
        """
        return self._config_data_dictionary_spec

    @config_data_dictionary_spec.setter
    def config_data_dictionary_spec(self, config_data_dictionary_spec: ConfigDataDictionarySpec):
        """Sets the config_data_dictionary_spec of this OdxAny.


        :param config_data_dictionary_spec: The config_data_dictionary_spec of this OdxAny.
        :type config_data_dictionary_spec: ConfigDataDictionarySpec
        """

        self._config_data_dictionary_spec = config_data_dictionary_spec

    @property
    def group_members(self) -> List[GroupMember]:
        """Gets the group_members of this OdxAny.


        :return: The group_members of this OdxAny.
        :rtype: List[GroupMember]
        """
        return self._group_members

    @group_members.setter
    def group_members(self, group_members: List[GroupMember]):
        """Sets the group_members of this OdxAny.


        :param group_members: The group_members of this OdxAny.
        :type group_members: List[GroupMember]
        """

        self._group_members = group_members

    @property
    def mem(self) -> Mem:
        """Gets the mem of this OdxAny.


        :return: The mem of this OdxAny.
        :rtype: Mem
        """
        return self._mem

    @mem.setter
    def mem(self, mem: Mem):
        """Sets the mem of this OdxAny.


        :param mem: The mem of this OdxAny.
        :type mem: Mem
        """

        self._mem = mem

    @property
    def phys_mem(self) -> PhysMem:
        """Gets the phys_mem of this OdxAny.


        :return: The phys_mem of this OdxAny.
        :rtype: PhysMem
        """
        return self._phys_mem

    @phys_mem.setter
    def phys_mem(self, phys_mem: PhysMem):
        """Sets the phys_mem of this OdxAny.


        :param phys_mem: The phys_mem of this OdxAny.
        :type phys_mem: PhysMem
        """

        self._phys_mem = phys_mem

    @property
    def flash_classes(self) -> List[FlashClass]:
        """Gets the flash_classes of this OdxAny.


        :return: The flash_classes of this OdxAny.
        :rtype: List[FlashClass]
        """
        return self._flash_classes

    @flash_classes.setter
    def flash_classes(self, flash_classes: List[FlashClass]):
        """Sets the flash_classes of this OdxAny.


        :param flash_classes: The flash_classes of this OdxAny.
        :type flash_classes: List[FlashClass]
        """

        self._flash_classes = flash_classes

    @property
    def session_descs(self) -> List[SessionDesc]:
        """Gets the session_descs of this OdxAny.


        :return: The session_descs of this OdxAny.
        :rtype: List[SessionDesc]
        """
        return self._session_descs

    @session_descs.setter
    def session_descs(self, session_descs: List[SessionDesc]):
        """Sets the session_descs of this OdxAny.


        :param session_descs: The session_descs of this OdxAny.
        :type session_descs: List[SessionDesc]
        """

        self._session_descs = session_descs

    @property
    def ident_descs(self) -> List[IdentDesc]:
        """Gets the ident_descs of this OdxAny.


        :return: The ident_descs of this OdxAny.
        :rtype: List[IdentDesc]
        """
        return self._ident_descs

    @ident_descs.setter
    def ident_descs(self, ident_descs: List[IdentDesc]):
        """Sets the ident_descs of this OdxAny.


        :param ident_descs: The ident_descs of this OdxAny.
        :type ident_descs: List[IdentDesc]
        """

        self._ident_descs = ident_descs

    @property
    def ecu_mem_ref(self) -> OdxLinkRef:
        """Gets the ecu_mem_ref of this OdxAny.


        :return: The ecu_mem_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._ecu_mem_ref

    @ecu_mem_ref.setter
    def ecu_mem_ref(self, ecu_mem_ref: OdxLinkRef):
        """Sets the ecu_mem_ref of this OdxAny.


        :param ecu_mem_ref: The ecu_mem_ref of this OdxAny.
        :type ecu_mem_ref: OdxLinkRef
        """

        self._ecu_mem_ref = ecu_mem_ref

    @property
    def layer_refs(self) -> List[OdxLinkRef]:
        """Gets the layer_refs of this OdxAny.


        :return: The layer_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._layer_refs

    @layer_refs.setter
    def layer_refs(self, layer_refs: List[OdxLinkRef]):
        """Sets the layer_refs of this OdxAny.


        :param layer_refs: The layer_refs of this OdxAny.
        :type layer_refs: List[OdxLinkRef]
        """

        self._layer_refs = layer_refs

    @property
    def all_variant_refs(self) -> List[OdxLinkRef]:
        """Gets the all_variant_refs of this OdxAny.


        :return: The all_variant_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._all_variant_refs

    @all_variant_refs.setter
    def all_variant_refs(self, all_variant_refs: List[OdxLinkRef]):
        """Sets the all_variant_refs of this OdxAny.


        :param all_variant_refs: The all_variant_refs of this OdxAny.
        :type all_variant_refs: List[OdxLinkRef]
        """

        self._all_variant_refs = all_variant_refs

    @property
    def ecu_mem(self) -> EcuMem:
        """Gets the ecu_mem of this OdxAny.


        :return: The ecu_mem of this OdxAny.
        :rtype: EcuMem
        """
        return self._ecu_mem

    @ecu_mem.setter
    def ecu_mem(self, ecu_mem: EcuMem):
        """Sets the ecu_mem of this OdxAny.


        :param ecu_mem: The ecu_mem of this OdxAny.
        :type ecu_mem: EcuMem
        """

        self._ecu_mem = ecu_mem

    @property
    def layers(self) -> List[EcuMemConnectorResolvedLayersInner]:
        """Gets the layers of this OdxAny.


        :return: The layers of this OdxAny.
        :rtype: List[EcuMemConnectorResolvedLayersInner]
        """
        return self._layers

    @layers.setter
    def layers(self, layers: List[EcuMemConnectorResolvedLayersInner]):
        """Sets the layers of this OdxAny.


        :param layers: The layers of this OdxAny.
        :type layers: List[EcuMemConnectorResolvedLayersInner]
        """

        self._layers = layers

    @property
    def all_variants(self) -> List[BaseVariant]:
        """Gets the all_variants of this OdxAny.


        :return: The all_variants of this OdxAny.
        :rtype: List[BaseVariant]
        """
        return self._all_variants

    @all_variants.setter
    def all_variants(self, all_variants: List[BaseVariant]):
        """Sets the all_variants of this OdxAny.


        :param all_variants: The all_variants of this OdxAny.
        :type all_variants: List[BaseVariant]
        """

        self._all_variants = all_variants

    @property
    def component_type(self) -> InfoComponentType:
        """Gets the component_type of this OdxAny.


        :return: The component_type of this OdxAny.
        :rtype: InfoComponentType
        """
        return self._component_type

    @component_type.setter
    def component_type(self, component_type: InfoComponentType):
        """Sets the component_type of this OdxAny.


        :param component_type: The component_type of this OdxAny.
        :type component_type: InfoComponentType
        """

        self._component_type = component_type

    @property
    def matching_components(self) -> List[MatchingComponent]:
        """Gets the matching_components of this OdxAny.


        :return: The matching_components of this OdxAny.
        :rtype: List[MatchingComponent]
        """
        return self._matching_components

    @matching_components.setter
    def matching_components(self, matching_components: List[MatchingComponent]):
        """Sets the matching_components of this OdxAny.


        :param matching_components: The matching_components of this OdxAny.
        :type matching_components: List[MatchingComponent]
        """

        self._matching_components = matching_components

    @property
    def matching_parameters(self) -> List[MatchingParameter]:
        """Gets the matching_parameters of this OdxAny.


        :return: The matching_parameters of this OdxAny.
        :rtype: List[MatchingParameter]
        """
        return self._matching_parameters

    @matching_parameters.setter
    def matching_parameters(self, matching_parameters: List[MatchingParameter]):
        """Sets the matching_parameters of this OdxAny.


        :param matching_parameters: The matching_parameters of this OdxAny.
        :type matching_parameters: List[MatchingParameter]
        """

        self._matching_parameters = matching_parameters

    @property
    def ecu_variant_patterns(self) -> List[EcuVariantPattern]:
        """Gets the ecu_variant_patterns of this OdxAny.


        :return: The ecu_variant_patterns of this OdxAny.
        :rtype: List[EcuVariantPattern]
        """
        return self._ecu_variant_patterns

    @ecu_variant_patterns.setter
    def ecu_variant_patterns(self, ecu_variant_patterns: List[EcuVariantPattern]):
        """Sets the ecu_variant_patterns of this OdxAny.


        :param ecu_variant_patterns: The ecu_variant_patterns of this OdxAny.
        :type ecu_variant_patterns: List[EcuVariantPattern]
        """

        self._ecu_variant_patterns = ecu_variant_patterns

    @property
    def value_raw(self) -> str:
        """Gets the value_raw of this OdxAny.


        :return: The value_raw of this OdxAny.
        :rtype: str
        """
        return self._value_raw

    @value_raw.setter
    def value_raw(self, value_raw: str):
        """Sets the value_raw of this OdxAny.


        :param value_raw: The value_raw of this OdxAny.
        :type value_raw: str
        """

        self._value_raw = value_raw

    @property
    def max_number_of_items(self) -> int:
        """Gets the max_number_of_items of this OdxAny.


        :return: The max_number_of_items of this OdxAny.
        :rtype: int
        """
        return self._max_number_of_items

    @max_number_of_items.setter
    def max_number_of_items(self, max_number_of_items: int):
        """Sets the max_number_of_items of this OdxAny.


        :param max_number_of_items: The max_number_of_items of this OdxAny.
        :type max_number_of_items: int
        """

        self._max_number_of_items = max_number_of_items

    @property
    def min_number_of_items(self) -> int:
        """Gets the min_number_of_items of this OdxAny.


        :return: The min_number_of_items of this OdxAny.
        :rtype: int
        """
        return self._min_number_of_items

    @min_number_of_items.setter
    def min_number_of_items(self, min_number_of_items: int):
        """Sets the min_number_of_items of this OdxAny.


        :param min_number_of_items: The min_number_of_items of this OdxAny.
        :type min_number_of_items: int
        """

        self._min_number_of_items = min_number_of_items

    @property
    def env_data_snref(self) -> str:
        """Gets the env_data_snref of this OdxAny.


        :return: The env_data_snref of this OdxAny.
        :rtype: str
        """
        return self._env_data_snref

    @env_data_snref.setter
    def env_data_snref(self, env_data_snref: str):
        """Sets the env_data_snref of this OdxAny.


        :param env_data_snref: The env_data_snref of this OdxAny.
        :type env_data_snref: str
        """

        self._env_data_snref = env_data_snref

    @property
    def env_data_desc(self) -> EnvironmentDataDescription:
        """Gets the env_data_desc of this OdxAny.


        :return: The env_data_desc of this OdxAny.
        :rtype: EnvironmentDataDescription
        """
        return self._env_data_desc

    @env_data_desc.setter
    def env_data_desc(self, env_data_desc: EnvironmentDataDescription):
        """Sets the env_data_desc of this OdxAny.


        :param env_data_desc: The env_data_desc of this OdxAny.
        :type env_data_desc: EnvironmentDataDescription
        """

        self._env_data_desc = env_data_desc

    @property
    def env_data(self) -> EnvironmentData:
        """Gets the env_data of this OdxAny.


        :return: The env_data of this OdxAny.
        :rtype: EnvironmentData
        """
        return self._env_data

    @env_data.setter
    def env_data(self, env_data: EnvironmentData):
        """Sets the env_data of this OdxAny.


        :param env_data: The env_data of this OdxAny.
        :type env_data: EnvironmentData
        """

        self._env_data = env_data

    @property
    def all_value(self) -> bool:
        """Gets the all_value of this OdxAny.


        :return: The all_value of this OdxAny.
        :rtype: bool
        """
        return self._all_value

    @all_value.setter
    def all_value(self, all_value: bool):
        """Sets the all_value of this OdxAny.


        :param all_value: The all_value of this OdxAny.
        :type all_value: bool
        """

        self._all_value = all_value

    @property
    def dtc_values(self) -> List[int]:
        """Gets the dtc_values of this OdxAny.


        :return: The dtc_values of this OdxAny.
        :rtype: List[int]
        """
        return self._dtc_values

    @dtc_values.setter
    def dtc_values(self, dtc_values: List[int]):
        """Sets the dtc_values of this OdxAny.


        :param dtc_values: The dtc_values of this OdxAny.
        :type dtc_values: List[int]
        """

        self._dtc_values = dtc_values

    @property
    def param_snref(self) -> str:
        """Gets the param_snref of this OdxAny.


        :return: The param_snref of this OdxAny.
        :rtype: str
        """
        return self._param_snref

    @param_snref.setter
    def param_snref(self, param_snref: str):
        """Sets the param_snref of this OdxAny.


        :param param_snref: The param_snref of this OdxAny.
        :type param_snref: str
        """

        self._param_snref = param_snref

    @property
    def param_snpathref(self) -> str:
        """Gets the param_snpathref of this OdxAny.


        :return: The param_snpathref of this OdxAny.
        :rtype: str
        """
        return self._param_snpathref

    @param_snpathref.setter
    def param_snpathref(self, param_snpathref: str):
        """Sets the param_snpathref of this OdxAny.


        :param param_snpathref: The param_snpathref of this OdxAny.
        :type param_snpathref: str
        """

        self._param_snpathref = param_snpathref

    @property
    def env_data_refs(self) -> List[OdxLinkRef]:
        """Gets the env_data_refs of this OdxAny.


        :return: The env_data_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._env_data_refs

    @env_data_refs.setter
    def env_data_refs(self, env_data_refs: List[OdxLinkRef]):
        """Sets the env_data_refs of this OdxAny.


        :param env_data_refs: The env_data_refs of this OdxAny.
        :type env_data_refs: List[OdxLinkRef]
        """

        self._env_data_refs = env_data_refs

    @property
    def ident_values(self) -> List[IdentValue]:
        """Gets the ident_values of this OdxAny.


        :return: The ident_values of this OdxAny.
        :rtype: List[IdentValue]
        """
        return self._ident_values

    @ident_values.setter
    def ident_values(self, ident_values: List[IdentValue]):
        """Sets the ident_values of this OdxAny.


        :param ident_values: The ident_values of this OdxAny.
        :type ident_values: List[IdentValue]
        """

        self._ident_values = ident_values

    @property
    def size_length(self) -> int:
        """Gets the size_length of this OdxAny.


        :return: The size_length of this OdxAny.
        :rtype: int
        """
        return self._size_length

    @size_length.setter
    def size_length(self, size_length: int):
        """Sets the size_length of this OdxAny.


        :param size_length: The size_length of this OdxAny.
        :type size_length: int
        """

        self._size_length = size_length

    @property
    def address_length(self) -> int:
        """Gets the address_length of this OdxAny.


        :return: The address_length of this OdxAny.
        :rtype: int
        """
        return self._address_length

    @address_length.setter
    def address_length(self, address_length: int):
        """Sets the address_length of this OdxAny.


        :param address_length: The address_length of this OdxAny.
        :type address_length: int
        """

        self._address_length = address_length

    @property
    def encrypt_compress_method(self) -> EncryptCompressMethod:
        """Gets the encrypt_compress_method of this OdxAny.


        :return: The encrypt_compress_method of this OdxAny.
        :rtype: EncryptCompressMethod
        """
        return self._encrypt_compress_method

    @encrypt_compress_method.setter
    def encrypt_compress_method(self, encrypt_compress_method: EncryptCompressMethod):
        """Sets the encrypt_compress_method of this OdxAny.


        :param encrypt_compress_method: The encrypt_compress_method of this OdxAny.
        :type encrypt_compress_method: EncryptCompressMethod
        """

        self._encrypt_compress_method = encrypt_compress_method

    @property
    def method(self) -> str:
        """Gets the method of this OdxAny.


        :return: The method of this OdxAny.
        :rtype: str
        """
        return self._method

    @method.setter
    def method(self, method: str):
        """Sets the method of this OdxAny.


        :param method: The method of this OdxAny.
        :type method: str
        """

        self._method = method

    @property
    def href(self) -> str:
        """Gets the href of this OdxAny.


        :return: The href of this OdxAny.
        :rtype: str
        """
        return self._href

    @href.setter
    def href(self, href: str):
        """Sets the href of this OdxAny.


        :param href: The href of this OdxAny.
        :type href: str
        """

        self._href = href

    @property
    def ecu_mems(self) -> List[EcuMem]:
        """Gets the ecu_mems of this OdxAny.


        :return: The ecu_mems of this OdxAny.
        :rtype: List[EcuMem]
        """
        return self._ecu_mems

    @ecu_mems.setter
    def ecu_mems(self, ecu_mems: List[EcuMem]):
        """Sets the ecu_mems of this OdxAny.


        :param ecu_mems: The ecu_mems of this OdxAny.
        :type ecu_mems: List[EcuMem]
        """

        self._ecu_mems = ecu_mems

    @property
    def ecu_mem_connectors(self) -> List[EcuMemConnector]:
        """Gets the ecu_mem_connectors of this OdxAny.


        :return: The ecu_mem_connectors of this OdxAny.
        :rtype: List[EcuMemConnector]
        """
        return self._ecu_mem_connectors

    @ecu_mem_connectors.setter
    def ecu_mem_connectors(self, ecu_mem_connectors: List[EcuMemConnector]):
        """Sets the ecu_mem_connectors of this OdxAny.


        :param ecu_mem_connectors: The ecu_mem_connectors of this OdxAny.
        :type ecu_mem_connectors: List[EcuMemConnector]
        """

        self._ecu_mem_connectors = ecu_mem_connectors

    @property
    def logical_link_ref(self) -> OdxLinkRef:
        """Gets the logical_link_ref of this OdxAny.


        :return: The logical_link_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._logical_link_ref

    @logical_link_ref.setter
    def logical_link_ref(self, logical_link_ref: OdxLinkRef):
        """Sets the logical_link_ref of this OdxAny.


        :param logical_link_ref: The logical_link_ref of this OdxAny.
        :type logical_link_ref: OdxLinkRef
        """

        self._logical_link_ref = logical_link_ref

    @property
    def logical_link(self) -> LogicalLink:
        """Gets the logical_link of this OdxAny.


        :return: The logical_link of this OdxAny.
        :rtype: LogicalLink
        """
        return self._logical_link

    @logical_link.setter
    def logical_link(self, logical_link: LogicalLink):
        """Sets the logical_link of this OdxAny.


        :param logical_link: The logical_link of this OdxAny.
        :type logical_link: LogicalLink
        """

        self._logical_link = logical_link

    @property
    def function_nodes(self) -> List[FunctionNode]:
        """Gets the function_nodes of this OdxAny.


        :return: The function_nodes of this OdxAny.
        :rtype: List[FunctionNode]
        """
        return self._function_nodes

    @function_nodes.setter
    def function_nodes(self, function_nodes: List[FunctionNode]):
        """Sets the function_nodes of this OdxAny.


        :param function_nodes: The function_nodes of this OdxAny.
        :type function_nodes: List[FunctionNode]
        """

        self._function_nodes = function_nodes

    @property
    def function_node_groups(self) -> List[FunctionNodeGroup]:
        """Gets the function_node_groups of this OdxAny.


        :return: The function_node_groups of this OdxAny.
        :rtype: List[FunctionNodeGroup]
        """
        return self._function_node_groups

    @function_node_groups.setter
    def function_node_groups(self, function_node_groups: List[FunctionNodeGroup]):
        """Sets the function_node_groups of this OdxAny.


        :param function_node_groups: The function_node_groups of this OdxAny.
        :type function_node_groups: List[FunctionNodeGroup]
        """

        self._function_node_groups = function_node_groups

    @property
    def function_diag_comm_connector(self) -> FunctionDiagCommConnector:
        """Gets the function_diag_comm_connector of this OdxAny.


        :return: The function_diag_comm_connector of this OdxAny.
        :rtype: FunctionDiagCommConnector
        """
        return self._function_diag_comm_connector

    @function_diag_comm_connector.setter
    def function_diag_comm_connector(self, function_diag_comm_connector: FunctionDiagCommConnector):
        """Sets the function_diag_comm_connector of this OdxAny.


        :param function_diag_comm_connector: The function_diag_comm_connector of this OdxAny.
        :type function_diag_comm_connector: FunctionDiagCommConnector
        """

        self._function_diag_comm_connector = function_diag_comm_connector

    @property
    def function_node_refs(self) -> List[OdxLinkRef]:
        """Gets the function_node_refs of this OdxAny.


        :return: The function_node_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._function_node_refs

    @function_node_refs.setter
    def function_node_refs(self, function_node_refs: List[OdxLinkRef]):
        """Sets the function_node_refs of this OdxAny.


        :param function_node_refs: The function_node_refs of this OdxAny.
        :type function_node_refs: List[OdxLinkRef]
        """

        self._function_node_refs = function_node_refs

    @property
    def link_type(self) -> str:
        """Gets the link_type of this OdxAny.


        :return: The link_type of this OdxAny.
        :rtype: str
        """
        return self._link_type

    @link_type.setter
    def link_type(self, link_type: str):
        """Sets the link_type of this OdxAny.


        :param link_type: The link_type of this OdxAny.
        :type link_type: str
        """

        self._link_type = link_type

    @property
    def gateway_logical_link_refs(self) -> List[OdxLinkRef]:
        """Gets the gateway_logical_link_refs of this OdxAny.


        :return: The gateway_logical_link_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._gateway_logical_link_refs

    @gateway_logical_link_refs.setter
    def gateway_logical_link_refs(self, gateway_logical_link_refs: List[OdxLinkRef]):
        """Sets the gateway_logical_link_refs of this OdxAny.


        :param gateway_logical_link_refs: The gateway_logical_link_refs of this OdxAny.
        :type gateway_logical_link_refs: List[OdxLinkRef]
        """

        self._gateway_logical_link_refs = gateway_logical_link_refs

    @property
    def physical_vehicle_link_ref(self) -> OdxLinkRef:
        """Gets the physical_vehicle_link_ref of this OdxAny.


        :return: The physical_vehicle_link_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._physical_vehicle_link_ref

    @physical_vehicle_link_ref.setter
    def physical_vehicle_link_ref(self, physical_vehicle_link_ref: OdxLinkRef):
        """Sets the physical_vehicle_link_ref of this OdxAny.


        :param physical_vehicle_link_ref: The physical_vehicle_link_ref of this OdxAny.
        :type physical_vehicle_link_ref: OdxLinkRef
        """

        self._physical_vehicle_link_ref = physical_vehicle_link_ref

    @property
    def protocol_ref(self) -> OdxLinkRef:
        """Gets the protocol_ref of this OdxAny.


        :return: The protocol_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._protocol_ref

    @protocol_ref.setter
    def protocol_ref(self, protocol_ref: OdxLinkRef):
        """Sets the protocol_ref of this OdxAny.


        :param protocol_ref: The protocol_ref of this OdxAny.
        :type protocol_ref: OdxLinkRef
        """

        self._protocol_ref = protocol_ref

    @property
    def functional_group_ref(self) -> OdxLinkRef:
        """Gets the functional_group_ref of this OdxAny.


        :return: The functional_group_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._functional_group_ref

    @functional_group_ref.setter
    def functional_group_ref(self, functional_group_ref: OdxLinkRef):
        """Sets the functional_group_ref of this OdxAny.


        :param functional_group_ref: The functional_group_ref of this OdxAny.
        :type functional_group_ref: OdxLinkRef
        """

        self._functional_group_ref = functional_group_ref

    @property
    def ecu_proxy_refs(self) -> List[OdxLinkRef]:
        """Gets the ecu_proxy_refs of this OdxAny.


        :return: The ecu_proxy_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._ecu_proxy_refs

    @ecu_proxy_refs.setter
    def ecu_proxy_refs(self, ecu_proxy_refs: List[OdxLinkRef]):
        """Sets the ecu_proxy_refs of this OdxAny.


        :param ecu_proxy_refs: The ecu_proxy_refs of this OdxAny.
        :type ecu_proxy_refs: List[OdxLinkRef]
        """

        self._ecu_proxy_refs = ecu_proxy_refs

    @property
    def link_comparam_refs_raw(self) -> List[LinkComparamRef]:
        """Gets the link_comparam_refs_raw of this OdxAny.


        :return: The link_comparam_refs_raw of this OdxAny.
        :rtype: List[LinkComparamRef]
        """
        return self._link_comparam_refs_raw

    @link_comparam_refs_raw.setter
    def link_comparam_refs_raw(self, link_comparam_refs_raw: List[LinkComparamRef]):
        """Sets the link_comparam_refs_raw of this OdxAny.


        :param link_comparam_refs_raw: The link_comparam_refs_raw of this OdxAny.
        :type link_comparam_refs_raw: List[LinkComparamRef]
        """

        self._link_comparam_refs_raw = link_comparam_refs_raw

    @property
    def link_comparam_refs(self) -> List[LinkComparamRef]:
        """Gets the link_comparam_refs of this OdxAny.


        :return: The link_comparam_refs of this OdxAny.
        :rtype: List[LinkComparamRef]
        """
        return self._link_comparam_refs

    @link_comparam_refs.setter
    def link_comparam_refs(self, link_comparam_refs: List[LinkComparamRef]):
        """Sets the link_comparam_refs of this OdxAny.


        :param link_comparam_refs: The link_comparam_refs of this OdxAny.
        :type link_comparam_refs: List[LinkComparamRef]
        """

        self._link_comparam_refs = link_comparam_refs

    @property
    def gateway_logical_links(self) -> List[GatewayLogicalLink]:
        """Gets the gateway_logical_links of this OdxAny.


        :return: The gateway_logical_links of this OdxAny.
        :rtype: List[GatewayLogicalLink]
        """
        return self._gateway_logical_links

    @gateway_logical_links.setter
    def gateway_logical_links(self, gateway_logical_links: List[GatewayLogicalLink]):
        """Sets the gateway_logical_links of this OdxAny.


        :param gateway_logical_links: The gateway_logical_links of this OdxAny.
        :type gateway_logical_links: List[GatewayLogicalLink]
        """

        self._gateway_logical_links = gateway_logical_links

    @property
    def physical_vehicle_link(self) -> PhysicalVehicleLinkResolved:
        """Gets the physical_vehicle_link of this OdxAny.


        :return: The physical_vehicle_link of this OdxAny.
        :rtype: PhysicalVehicleLinkResolved
        """
        return self._physical_vehicle_link

    @physical_vehicle_link.setter
    def physical_vehicle_link(self, physical_vehicle_link: PhysicalVehicleLinkResolved):
        """Sets the physical_vehicle_link of this OdxAny.


        :param physical_vehicle_link: The physical_vehicle_link of this OdxAny.
        :type physical_vehicle_link: PhysicalVehicleLinkResolved
        """

        self._physical_vehicle_link = physical_vehicle_link

    @property
    def protocol(self) -> Protocol:
        """Gets the protocol of this OdxAny.


        :return: The protocol of this OdxAny.
        :rtype: Protocol
        """
        return self._protocol

    @protocol.setter
    def protocol(self, protocol: Protocol):
        """Sets the protocol of this OdxAny.


        :param protocol: The protocol of this OdxAny.
        :type protocol: Protocol
        """

        self._protocol = protocol

    @property
    def functional_group(self) -> FunctionalGroup:
        """Gets the functional_group of this OdxAny.


        :return: The functional_group of this OdxAny.
        :rtype: FunctionalGroup
        """
        return self._functional_group

    @functional_group.setter
    def functional_group(self, functional_group: FunctionalGroup):
        """Sets the functional_group of this OdxAny.


        :param functional_group: The functional_group of this OdxAny.
        :type functional_group: FunctionalGroup
        """

        self._functional_group = functional_group

    @property
    def ecu_proxies(self) -> List[EcuProxy]:
        """Gets the ecu_proxies of this OdxAny.


        :return: The ecu_proxies of this OdxAny.
        :rtype: List[EcuProxy]
        """
        return self._ecu_proxies

    @ecu_proxies.setter
    def ecu_proxies(self, ecu_proxies: List[EcuProxy]):
        """Sets the ecu_proxies of this OdxAny.


        :param ecu_proxies: The ecu_proxies of this OdxAny.
        :type ecu_proxies: List[EcuProxy]
        """

        self._ecu_proxies = ecu_proxies

    @property
    def prot_stack(self) -> ProtStack:
        """Gets the prot_stack of this OdxAny.


        :return: The prot_stack of this OdxAny.
        :rtype: ProtStack
        """
        return self._prot_stack

    @prot_stack.setter
    def prot_stack(self, prot_stack: ProtStack):
        """Sets the prot_stack of this OdxAny.


        :param prot_stack: The prot_stack of this OdxAny.
        :type prot_stack: ProtStack
        """

        self._prot_stack = prot_stack

    @property
    def funct_resolution_link_ref(self) -> OdxLinkRef:
        """Gets the funct_resolution_link_ref of this OdxAny.


        :return: The funct_resolution_link_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._funct_resolution_link_ref

    @funct_resolution_link_ref.setter
    def funct_resolution_link_ref(self, funct_resolution_link_ref: OdxLinkRef):
        """Sets the funct_resolution_link_ref of this OdxAny.


        :param funct_resolution_link_ref: The funct_resolution_link_ref of this OdxAny.
        :type funct_resolution_link_ref: OdxLinkRef
        """

        self._funct_resolution_link_ref = funct_resolution_link_ref

    @property
    def phys_resolution_link_ref(self) -> OdxLinkRef:
        """Gets the phys_resolution_link_ref of this OdxAny.


        :return: The phys_resolution_link_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._phys_resolution_link_ref

    @phys_resolution_link_ref.setter
    def phys_resolution_link_ref(self, phys_resolution_link_ref: OdxLinkRef):
        """Sets the phys_resolution_link_ref of this OdxAny.


        :param phys_resolution_link_ref: The phys_resolution_link_ref of this OdxAny.
        :type phys_resolution_link_ref: OdxLinkRef
        """

        self._phys_resolution_link_ref = phys_resolution_link_ref

    @property
    def funct_resolution_link(self) -> LogicalLink:
        """Gets the funct_resolution_link of this OdxAny.


        :return: The funct_resolution_link of this OdxAny.
        :rtype: LogicalLink
        """
        return self._funct_resolution_link

    @funct_resolution_link.setter
    def funct_resolution_link(self, funct_resolution_link: LogicalLink):
        """Sets the funct_resolution_link of this OdxAny.


        :param funct_resolution_link: The funct_resolution_link of this OdxAny.
        :type funct_resolution_link: LogicalLink
        """

        self._funct_resolution_link = funct_resolution_link

    @property
    def phys_resolution_link(self) -> LogicalLink:
        """Gets the phys_resolution_link of this OdxAny.


        :return: The phys_resolution_link of this OdxAny.
        :rtype: LogicalLink
        """
        return self._phys_resolution_link

    @phys_resolution_link.setter
    def phys_resolution_link(self, phys_resolution_link: LogicalLink):
        """Sets the phys_resolution_link of this OdxAny.


        :param phys_resolution_link: The phys_resolution_link of this OdxAny.
        :type phys_resolution_link: LogicalLink
        """

        self._phys_resolution_link = phys_resolution_link

    @property
    def ident_if_snref(self) -> str:
        """Gets the ident_if_snref of this OdxAny.


        :return: The ident_if_snref of this OdxAny.
        :rtype: str
        """
        return self._ident_if_snref

    @ident_if_snref.setter
    def ident_if_snref(self, ident_if_snref: str):
        """Sets the ident_if_snref of this OdxAny.


        :param ident_if_snref: The ident_if_snref of this OdxAny.
        :type ident_if_snref: str
        """

        self._ident_if_snref = ident_if_snref

    @property
    def out_param_if_snpathref(self) -> str:
        """Gets the out_param_if_snpathref of this OdxAny.


        :return: The out_param_if_snpathref of this OdxAny.
        :rtype: str
        """
        return self._out_param_if_snpathref

    @out_param_if_snpathref.setter
    def out_param_if_snpathref(self, out_param_if_snpathref: str):
        """Sets the out_param_if_snpathref of this OdxAny.


        :param out_param_if_snpathref: The out_param_if_snpathref of this OdxAny.
        :type out_param_if_snpathref: str
        """

        self._out_param_if_snpathref = out_param_if_snpathref

    @property
    def dop_base_ref(self) -> OdxLinkRef:
        """Gets the dop_base_ref of this OdxAny.


        :return: The dop_base_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._dop_base_ref

    @dop_base_ref.setter
    def dop_base_ref(self, dop_base_ref: OdxLinkRef):
        """Sets the dop_base_ref of this OdxAny.


        :param dop_base_ref: The dop_base_ref of this OdxAny.
        :type dop_base_ref: OdxLinkRef
        """

        self._dop_base_ref = dop_base_ref

    @property
    def scale_constrs(self) -> List[ScaleConstr]:
        """Gets the scale_constrs of this OdxAny.


        :return: The scale_constrs of this OdxAny.
        :rtype: List[ScaleConstr]
        """
        return self._scale_constrs

    @scale_constrs.setter
    def scale_constrs(self, scale_constrs: List[ScaleConstr]):
        """Sets the scale_constrs of this OdxAny.


        :param scale_constrs: The scale_constrs of this OdxAny.
        :type scale_constrs: List[ScaleConstr]
        """

        self._scale_constrs = scale_constrs

    @property
    def phys_constant_value(self) -> str:
        """Gets the phys_constant_value of this OdxAny.


        :return: The phys_constant_value of this OdxAny.
        :rtype: str
        """
        return self._phys_constant_value

    @phys_constant_value.setter
    def phys_constant_value(self, phys_constant_value: str):
        """Sets the phys_constant_value of this OdxAny.


        :param phys_constant_value: The phys_constant_value of this OdxAny.
        :type phys_constant_value: str
        """

        self._phys_constant_value = phys_constant_value

    @property
    def meaning(self) -> Text:
        """Gets the meaning of this OdxAny.


        :return: The meaning of this OdxAny.
        :rtype: Text
        """
        return self._meaning

    @meaning.setter
    def meaning(self, meaning: Text):
        """Sets the meaning of this OdxAny.


        :param meaning: The meaning of this OdxAny.
        :type meaning: Text
        """

        self._meaning = meaning

    @property
    def bit_length(self) -> int:
        """Gets the bit_length of this OdxAny.


        :return: The bit_length of this OdxAny.
        :rtype: int
        """
        return self._bit_length

    @bit_length.setter
    def bit_length(self, bit_length: int):
        """Sets the bit_length of this OdxAny.


        :param bit_length: The bit_length of this OdxAny.
        :type bit_length: int
        """

        self._bit_length = bit_length

    @property
    def dop_snref(self) -> str:
        """Gets the dop_snref of this OdxAny.


        :return: The dop_snref of this OdxAny.
        :rtype: str
        """
        return self._dop_snref

    @dop_snref.setter
    def dop_snref(self, dop_snref: str):
        """Sets the dop_snref of this OdxAny.


        :param dop_snref: The dop_snref of this OdxAny.
        :type dop_snref: str
        """

        self._dop_snref = dop_snref

    @property
    def code_file(self) -> str:
        """Gets the code_file of this OdxAny.


        :return: The code_file of this OdxAny.
        :rtype: str
        """
        return self._code_file

    @code_file.setter
    def code_file(self, code_file: str):
        """Sets the code_file of this OdxAny.


        :param code_file: The code_file of this OdxAny.
        :type code_file: str
        """

        self._code_file = code_file

    @property
    def encryption(self) -> str:
        """Gets the encryption of this OdxAny.


        :return: The encryption of this OdxAny.
        :rtype: str
        """
        return self._encryption

    @encryption.setter
    def encryption(self, encryption: str):
        """Sets the encryption of this OdxAny.


        :param encryption: The encryption of this OdxAny.
        :type encryption: str
        """

        self._encryption = encryption

    @property
    def syntax(self) -> str:
        """Gets the syntax of this OdxAny.


        :return: The syntax of this OdxAny.
        :rtype: str
        """
        return self._syntax

    @syntax.setter
    def syntax(self, syntax: str):
        """Sets the syntax of this OdxAny.


        :param syntax: The syntax of this OdxAny.
        :type syntax: str
        """

        self._syntax = syntax

    @property
    def revision(self) -> str:
        """Gets the revision of this OdxAny.


        :return: The revision of this OdxAny.
        :rtype: str
        """
        return self._revision

    @revision.setter
    def revision(self, revision: str):
        """Sets the revision of this OdxAny.


        :param revision: The revision of this OdxAny.
        :type revision: str
        """

        self._revision = revision

    @property
    def entrypoint(self) -> str:
        """Gets the entrypoint of this OdxAny.


        :return: The entrypoint of this OdxAny.
        :rtype: str
        """
        return self._entrypoint

    @entrypoint.setter
    def entrypoint(self, entrypoint: str):
        """Sets the entrypoint of this OdxAny.


        :param entrypoint: The entrypoint of this OdxAny.
        :type entrypoint: str
        """

        self._entrypoint = entrypoint

    @property
    def interval_type(self) -> IntervalType:
        """Gets the interval_type of this OdxAny.


        :return: The interval_type of this OdxAny.
        :rtype: IntervalType
        """
        return self._interval_type

    @interval_type.setter
    def interval_type(self, interval_type: IntervalType):
        """Sets the interval_type of this OdxAny.


        :param interval_type: The interval_type of this OdxAny.
        :type interval_type: IntervalType
        """

        self._interval_type = interval_type

    @property
    def factor(self) -> float:
        """Gets the factor of this OdxAny.


        :return: The factor of this OdxAny.
        :rtype: float
        """
        return self._factor

    @factor.setter
    def factor(self, factor: float):
        """Sets the factor of this OdxAny.


        :param factor: The factor of this OdxAny.
        :type factor: float
        """

        self._factor = factor

    @property
    def denominator(self) -> float:
        """Gets the denominator of this OdxAny.


        :return: The denominator of this OdxAny.
        :rtype: float
        """
        return self._denominator

    @denominator.setter
    def denominator(self, denominator: float):
        """Sets the denominator of this OdxAny.


        :param denominator: The denominator of this OdxAny.
        :type denominator: float
        """

        self._denominator = denominator

    @property
    def internal_lower_limit(self) -> Limit:
        """Gets the internal_lower_limit of this OdxAny.


        :return: The internal_lower_limit of this OdxAny.
        :rtype: Limit
        """
        return self._internal_lower_limit

    @internal_lower_limit.setter
    def internal_lower_limit(self, internal_lower_limit: Limit):
        """Sets the internal_lower_limit of this OdxAny.


        :param internal_lower_limit: The internal_lower_limit of this OdxAny.
        :type internal_lower_limit: Limit
        """

        self._internal_lower_limit = internal_lower_limit

    @property
    def internal_upper_limit(self) -> Limit:
        """Gets the internal_upper_limit of this OdxAny.


        :return: The internal_upper_limit of this OdxAny.
        :rtype: Limit
        """
        return self._internal_upper_limit

    @internal_upper_limit.setter
    def internal_upper_limit(self, internal_upper_limit: Limit):
        """Sets the internal_upper_limit of this OdxAny.


        :param internal_upper_limit: The internal_upper_limit of this OdxAny.
        :type internal_upper_limit: Limit
        """

        self._internal_upper_limit = internal_upper_limit

    @property
    def inverse_value(self) -> CompuRationalCoeffsNumeratorsInner:
        """Gets the inverse_value of this OdxAny.


        :return: The inverse_value of this OdxAny.
        :rtype: CompuRationalCoeffsNumeratorsInner
        """
        return self._inverse_value

    @inverse_value.setter
    def inverse_value(self, inverse_value: CompuRationalCoeffsNumeratorsInner):
        """Sets the inverse_value of this OdxAny.


        :param inverse_value: The inverse_value of this OdxAny.
        :type inverse_value: CompuRationalCoeffsNumeratorsInner
        """

        self._inverse_value = inverse_value

    @property
    def simple_value(self) -> str:
        """Gets the simple_value of this OdxAny.


        :return: The simple_value of this OdxAny.
        :rtype: str
        """
        return self._simple_value

    @simple_value.setter
    def simple_value(self, simple_value: str):
        """Sets the simple_value of this OdxAny.


        :param simple_value: The simple_value of this OdxAny.
        :type simple_value: str
        """

        self._simple_value = simple_value

    @property
    def complex_value(self) -> List[ComparamInstanceValueAnyOfInner]:
        """Gets the complex_value of this OdxAny.


        :return: The complex_value of this OdxAny.
        :rtype: List[ComparamInstanceValueAnyOfInner]
        """
        return self._complex_value

    @complex_value.setter
    def complex_value(self, complex_value: List[ComparamInstanceValueAnyOfInner]):
        """Sets the complex_value of this OdxAny.


        :param complex_value: The complex_value of this OdxAny.
        :type complex_value: List[ComparamInstanceValueAnyOfInner]
        """

        self._complex_value = complex_value

    @property
    def not_inherited_dtc_snrefs(self) -> List[str]:
        """Gets the not_inherited_dtc_snrefs of this OdxAny.


        :return: The not_inherited_dtc_snrefs of this OdxAny.
        :rtype: List[str]
        """
        return self._not_inherited_dtc_snrefs

    @not_inherited_dtc_snrefs.setter
    def not_inherited_dtc_snrefs(self, not_inherited_dtc_snrefs: List[str]):
        """Sets the not_inherited_dtc_snrefs of this OdxAny.


        :param not_inherited_dtc_snrefs: The not_inherited_dtc_snrefs of this OdxAny.
        :type not_inherited_dtc_snrefs: List[str]
        """

        self._not_inherited_dtc_snrefs = not_inherited_dtc_snrefs

    @property
    def not_inherited_dtcs(self) -> List[DiagnosticTroubleCode]:
        """Gets the not_inherited_dtcs of this OdxAny.


        :return: The not_inherited_dtcs of this OdxAny.
        :rtype: List[DiagnosticTroubleCode]
        """
        return self._not_inherited_dtcs

    @not_inherited_dtcs.setter
    def not_inherited_dtcs(self, not_inherited_dtcs: List[DiagnosticTroubleCode]):
        """Sets the not_inherited_dtcs of this OdxAny.


        :param not_inherited_dtcs: The not_inherited_dtcs of this OdxAny.
        :type not_inherited_dtcs: List[DiagnosticTroubleCode]
        """

        self._not_inherited_dtcs = not_inherited_dtcs

    @property
    def expected_value(self) -> str:
        """Gets the expected_value of this OdxAny.


        :return: The expected_value of this OdxAny.
        :rtype: str
        """
        return self._expected_value

    @expected_value.setter
    def expected_value(self, expected_value: str):
        """Sets the expected_value of this OdxAny.


        :param expected_value: The expected_value of this OdxAny.
        :type expected_value: str
        """

        self._expected_value = expected_value

    @property
    def use_physical_addressing_raw(self) -> bool:
        """Gets the use_physical_addressing_raw of this OdxAny.


        :return: The use_physical_addressing_raw of this OdxAny.
        :rtype: bool
        """
        return self._use_physical_addressing_raw

    @use_physical_addressing_raw.setter
    def use_physical_addressing_raw(self, use_physical_addressing_raw: bool):
        """Sets the use_physical_addressing_raw of this OdxAny.


        :param use_physical_addressing_raw: The use_physical_addressing_raw of this OdxAny.
        :type use_physical_addressing_raw: bool
        """

        self._use_physical_addressing_raw = use_physical_addressing_raw

    @property
    def use_physical_addressing(self) -> bool:
        """Gets the use_physical_addressing of this OdxAny.


        :return: The use_physical_addressing of this OdxAny.
        :rtype: bool
        """
        return self._use_physical_addressing

    @use_physical_addressing.setter
    def use_physical_addressing(self, use_physical_addressing: bool):
        """Sets the use_physical_addressing of this OdxAny.


        :param use_physical_addressing: The use_physical_addressing of this OdxAny.
        :type use_physical_addressing: bool
        """

        self._use_physical_addressing = use_physical_addressing

    @property
    def multiple_ecu_job_ref(self) -> OdxLinkRef:
        """Gets the multiple_ecu_job_ref of this OdxAny.


        :return: The multiple_ecu_job_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._multiple_ecu_job_ref

    @multiple_ecu_job_ref.setter
    def multiple_ecu_job_ref(self, multiple_ecu_job_ref: OdxLinkRef):
        """Sets the multiple_ecu_job_ref of this OdxAny.


        :param multiple_ecu_job_ref: The multiple_ecu_job_ref of this OdxAny.
        :type multiple_ecu_job_ref: OdxLinkRef
        """

        self._multiple_ecu_job_ref = multiple_ecu_job_ref

    @property
    def multiple_ecu_job(self) -> MultipleEcuJob:
        """Gets the multiple_ecu_job of this OdxAny.


        :return: The multiple_ecu_job of this OdxAny.
        :rtype: MultipleEcuJob
        """
        return self._multiple_ecu_job

    @multiple_ecu_job.setter
    def multiple_ecu_job(self, multiple_ecu_job: MultipleEcuJob):
        """Sets the multiple_ecu_job of this OdxAny.


        :param multiple_ecu_job: The multiple_ecu_job of this OdxAny.
        :type multiple_ecu_job: MultipleEcuJob
        """

        self._multiple_ecu_job = multiple_ecu_job

    @property
    def request_byte_position(self) -> int:
        """Gets the request_byte_position of this OdxAny.


        :return: The request_byte_position of this OdxAny.
        :rtype: int
        """
        return self._request_byte_position

    @request_byte_position.setter
    def request_byte_position(self, request_byte_position: int):
        """Sets the request_byte_position of this OdxAny.


        :param request_byte_position: The request_byte_position of this OdxAny.
        :type request_byte_position: int
        """

        self._request_byte_position = request_byte_position

    @property
    def byte_length(self) -> int:
        """Gets the byte_length of this OdxAny.


        :return: The byte_length of this OdxAny.
        :rtype: int
        """
        return self._byte_length

    @byte_length.setter
    def byte_length(self, byte_length: int):
        """Sets the byte_length of this OdxAny.


        :param byte_length: The byte_length of this OdxAny.
        :type byte_length: int
        """

        self._byte_length = byte_length

    @property
    def sessions(self) -> List[Session]:
        """Gets the sessions of this OdxAny.


        :return: The sessions of this OdxAny.
        :rtype: List[Session]
        """
        return self._sessions

    @sessions.setter
    def sessions(self, sessions: List[Session]):
        """Sets the sessions of this OdxAny.


        :param sessions: The sessions of this OdxAny.
        :type sessions: List[Session]
        """

        self._sessions = sessions

    @property
    def datablocks(self) -> List[Datablock]:
        """Gets the datablocks of this OdxAny.


        :return: The datablocks of this OdxAny.
        :rtype: List[Datablock]
        """
        return self._datablocks

    @datablocks.setter
    def datablocks(self, datablocks: List[Datablock]):
        """Sets the datablocks of this OdxAny.


        :param datablocks: The datablocks of this OdxAny.
        :type datablocks: List[Datablock]
        """

        self._datablocks = datablocks

    @property
    def flashdatas(self) -> List[Flashdata]:
        """Gets the flashdatas of this OdxAny.


        :return: The flashdatas of this OdxAny.
        :rtype: List[Flashdata]
        """
        return self._flashdatas

    @flashdatas.setter
    def flashdatas(self, flashdatas: List[Flashdata]):
        """Sets the flashdatas of this OdxAny.


        :param flashdatas: The flashdatas of this OdxAny.
        :type flashdatas: List[Flashdata]
        """

        self._flashdatas = flashdatas

    @property
    def max_length(self) -> int:
        """Gets the max_length of this OdxAny.


        :return: The max_length of this OdxAny.
        :rtype: int
        """
        return self._max_length

    @max_length.setter
    def max_length(self, max_length: int):
        """Sets the max_length of this OdxAny.


        :param max_length: The max_length of this OdxAny.
        :type max_length: int
        """

        self._max_length = max_length

    @property
    def min_length(self) -> int:
        """Gets the min_length of this OdxAny.


        :return: The min_length of this OdxAny.
        :rtype: int
        """
        return self._min_length

    @min_length.setter
    def min_length(self, min_length: int):
        """Sets the min_length of this OdxAny.


        :param min_length: The min_length of this OdxAny.
        :type min_length: int
        """

        self._min_length = min_length

    @property
    def termination(self) -> Termination:
        """Gets the termination of this OdxAny.


        :return: The termination of this OdxAny.
        :rtype: Termination
        """
        return self._termination

    @termination.setter
    def termination(self, termination: Termination):
        """Sets the termination of this OdxAny.


        :param termination: The termination of this OdxAny.
        :type termination: Termination
        """

        self._termination = termination

    @property
    def change(self) -> str:
        """Gets the change of this OdxAny.


        :return: The change of this OdxAny.
        :rtype: str
        """
        return self._change

    @change.setter
    def change(self, change: str):
        """Sets the change of this OdxAny.


        :param change: The change of this OdxAny.
        :type change: str
        """

        self._change = change

    @property
    def reason(self) -> str:
        """Gets the reason of this OdxAny.


        :return: The reason of this OdxAny.
        :rtype: str
        """
        return self._reason

    @reason.setter
    def reason(self, reason: str):
        """Sets the reason of this OdxAny.


        :param reason: The reason of this OdxAny.
        :type reason: str
        """

        self._reason = reason

    @property
    def prog_codes(self) -> List[ProgCode]:
        """Gets the prog_codes of this OdxAny.


        :return: The prog_codes of this OdxAny.
        :rtype: List[ProgCode]
        """
        return self._prog_codes

    @prog_codes.setter
    def prog_codes(self, prog_codes: List[ProgCode]):
        """Sets the prog_codes of this OdxAny.


        :param prog_codes: The prog_codes of this OdxAny.
        :type prog_codes: List[ProgCode]
        """

        self._prog_codes = prog_codes

    @property
    def input_params(self) -> List[InputParam]:
        """Gets the input_params of this OdxAny.


        :return: The input_params of this OdxAny.
        :rtype: List[InputParam]
        """
        return self._input_params

    @input_params.setter
    def input_params(self, input_params: List[InputParam]):
        """Sets the input_params of this OdxAny.


        :param input_params: The input_params of this OdxAny.
        :type input_params: List[InputParam]
        """

        self._input_params = input_params

    @property
    def output_params(self) -> List[OutputParam]:
        """Gets the output_params of this OdxAny.


        :return: The output_params of this OdxAny.
        :rtype: List[OutputParam]
        """
        return self._output_params

    @output_params.setter
    def output_params(self, output_params: List[OutputParam]):
        """Sets the output_params of this OdxAny.


        :param output_params: The output_params of this OdxAny.
        :type output_params: List[OutputParam]
        """

        self._output_params = output_params

    @property
    def neg_output_params(self) -> List[NegOutputParam]:
        """Gets the neg_output_params of this OdxAny.


        :return: The neg_output_params of this OdxAny.
        :rtype: List[NegOutputParam]
        """
        return self._neg_output_params

    @neg_output_params.setter
    def neg_output_params(self, neg_output_params: List[NegOutputParam]):
        """Sets the neg_output_params of this OdxAny.


        :param neg_output_params: The neg_output_params of this OdxAny.
        :type neg_output_params: List[NegOutputParam]
        """

        self._neg_output_params = neg_output_params

    @property
    def diag_layer_refs(self) -> List[OdxLinkRef]:
        """Gets the diag_layer_refs of this OdxAny.


        :return: The diag_layer_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._diag_layer_refs

    @diag_layer_refs.setter
    def diag_layer_refs(self, diag_layer_refs: List[OdxLinkRef]):
        """Sets the diag_layer_refs of this OdxAny.


        :param diag_layer_refs: The diag_layer_refs of this OdxAny.
        :type diag_layer_refs: List[OdxLinkRef]
        """

        self._diag_layer_refs = diag_layer_refs

    @property
    def diag_layers(self) -> List[DiagLayer]:
        """Gets the diag_layers of this OdxAny.


        :return: The diag_layers of this OdxAny.
        :rtype: List[DiagLayer]
        """
        return self._diag_layers

    @diag_layers.setter
    def diag_layers(self, diag_layers: List[DiagLayer]):
        """Sets the diag_layers of this OdxAny.


        :param diag_layers: The diag_layers of this OdxAny.
        :type diag_layers: List[DiagLayer]
        """

        self._diag_layers = diag_layers

    @property
    def switch_key(self) -> MultiplexerSwitchKey:
        """Gets the switch_key of this OdxAny.


        :return: The switch_key of this OdxAny.
        :rtype: MultiplexerSwitchKey
        """
        return self._switch_key

    @switch_key.setter
    def switch_key(self, switch_key: MultiplexerSwitchKey):
        """Sets the switch_key of this OdxAny.


        :param switch_key: The switch_key of this OdxAny.
        :type switch_key: MultiplexerSwitchKey
        """

        self._switch_key = switch_key

    @property
    def default_case(self) -> MultiplexerDefaultCase:
        """Gets the default_case of this OdxAny.


        :return: The default_case of this OdxAny.
        :rtype: MultiplexerDefaultCase
        """
        return self._default_case

    @default_case.setter
    def default_case(self, default_case: MultiplexerDefaultCase):
        """Sets the default_case of this OdxAny.


        :param default_case: The default_case of this OdxAny.
        :type default_case: MultiplexerDefaultCase
        """

        self._default_case = default_case

    @property
    def cases(self) -> List[MultiplexerCase]:
        """Gets the cases of this OdxAny.


        :return: The cases of this OdxAny.
        :rtype: List[MultiplexerCase]
        """
        return self._cases

    @cases.setter
    def cases(self, cases: List[MultiplexerCase]):
        """Sets the cases of this OdxAny.


        :param cases: The cases of this OdxAny.
        :type cases: List[MultiplexerCase]
        """

        self._cases = cases

    @property
    def negative_offset(self) -> int:
        """Gets the negative_offset of this OdxAny.


        :return: The negative_offset of this OdxAny.
        :rtype: int
        """
        return self._negative_offset

    @negative_offset.setter
    def negative_offset(self, negative_offset: int):
        """Sets the negative_offset of this OdxAny.


        :param negative_offset: The negative_offset of this OdxAny.
        :type negative_offset: int
        """

        self._negative_offset = negative_offset

    @property
    def coded_values_raw(self) -> List[str]:
        """Gets the coded_values_raw of this OdxAny.


        :return: The coded_values_raw of this OdxAny.
        :rtype: List[str]
        """
        return self._coded_values_raw

    @coded_values_raw.setter
    def coded_values_raw(self, coded_values_raw: List[str]):
        """Sets the coded_values_raw of this OdxAny.


        :param coded_values_raw: The coded_values_raw of this OdxAny.
        :type coded_values_raw: List[str]
        """

        self._coded_values_raw = coded_values_raw

    @property
    def coded_values(self) -> List[LimitValue]:
        """Gets the coded_values of this OdxAny.


        :return: The coded_values of this OdxAny.
        :rtype: List[LimitValue]
        """
        return self._coded_values

    @coded_values.setter
    def coded_values(self, coded_values: List[LimitValue]):
        """Sets the coded_values of this OdxAny.


        :param coded_values: The coded_values of this OdxAny.
        :type coded_values: List[LimitValue]
        """

        self._coded_values = coded_values

    @property
    def version(self) -> object:
        """Gets the version of this OdxAny.


        :return: The version of this OdxAny.
        :rtype: object
        """
        return self._version

    @version.setter
    def version(self, version: object):
        """Sets the version of this OdxAny.


        :param version: The version of this OdxAny.
        :type version: object
        """

        self._version = version

    @property
    def doc_fragments(self) -> List[OdxDocFragment]:
        """Gets the doc_fragments of this OdxAny.


        :return: The doc_fragments of this OdxAny.
        :rtype: List[OdxDocFragment]
        """
        return self._doc_fragments

    @doc_fragments.setter
    def doc_fragments(self, doc_fragments: List[OdxDocFragment]):
        """Sets the doc_fragments of this OdxAny.


        :param doc_fragments: The doc_fragments of this OdxAny.
        :type doc_fragments: List[OdxDocFragment]
        """

        self._doc_fragments = doc_fragments

    @property
    def doc_name(self) -> str:
        """Gets the doc_name of this OdxAny.


        :return: The doc_name of this OdxAny.
        :rtype: str
        """
        return self._doc_name

    @doc_name.setter
    def doc_name(self, doc_name: str):
        """Sets the doc_name of this OdxAny.


        :param doc_name: The doc_name of this OdxAny.
        :type doc_name: str
        """

        self._doc_name = doc_name

    @property
    def doc_type(self) -> DocType:
        """Gets the doc_type of this OdxAny.


        :return: The doc_type of this OdxAny.
        :rtype: DocType
        """
        return self._doc_type

    @doc_type.setter
    def doc_type(self, doc_type: DocType):
        """Sets the doc_type of this OdxAny.


        :param doc_type: The doc_type of this OdxAny.
        :type doc_type: DocType
        """

        self._doc_type = doc_type

    @property
    def local_id(self) -> str:
        """Gets the local_id of this OdxAny.


        :return: The local_id of this OdxAny.
        :rtype: str
        """
        return self._local_id

    @local_id.setter
    def local_id(self, local_id: str):
        """Sets the local_id of this OdxAny.


        :param local_id: The local_id of this OdxAny.
        :type local_id: str
        """

        self._local_id = local_id

    @property
    def item_values(self) -> List[ItemValue]:
        """Gets the item_values of this OdxAny.


        :return: The item_values of this OdxAny.
        :rtype: List[ItemValue]
        """
        return self._item_values

    @item_values.setter
    def item_values(self, item_values: List[ItemValue]):
        """Sets the item_values of this OdxAny.


        :param item_values: The item_values of this OdxAny.
        :type item_values: List[ItemValue]
        """

        self._item_values = item_values

    @property
    def write_audience(self) -> Audience:
        """Gets the write_audience of this OdxAny.


        :return: The write_audience of this OdxAny.
        :rtype: Audience
        """
        return self._write_audience

    @write_audience.setter
    def write_audience(self, write_audience: Audience):
        """Sets the write_audience of this OdxAny.


        :param write_audience: The write_audience of this OdxAny.
        :type write_audience: Audience
        """

        self._write_audience = write_audience

    @property
    def read_audience(self) -> Audience:
        """Gets the read_audience of this OdxAny.


        :return: The read_audience of this OdxAny.
        :rtype: Audience
        """
        return self._read_audience

    @read_audience.setter
    def read_audience(self, read_audience: Audience):
        """Sets the read_audience of this OdxAny.


        :param read_audience: The read_audience of this OdxAny.
        :type read_audience: Audience
        """

        self._read_audience = read_audience

    @property
    def ident_value(self) -> IdentValue:
        """Gets the ident_value of this OdxAny.


        :return: The ident_value of this OdxAny.
        :rtype: IdentValue
        """
        return self._ident_value

    @ident_value.setter
    def ident_value(self, ident_value: IdentValue):
        """Sets the ident_value of this OdxAny.


        :param ident_value: The ident_value of this OdxAny.
        :type ident_value: IdentValue
        """

        self._ident_value = ident_value

    @property
    def length_key_ref(self) -> OdxLinkRef:
        """Gets the length_key_ref of this OdxAny.


        :return: The length_key_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._length_key_ref

    @length_key_ref.setter
    def length_key_ref(self, length_key_ref: OdxLinkRef):
        """Sets the length_key_ref of this OdxAny.


        :param length_key_ref: The length_key_ref of this OdxAny.
        :type length_key_ref: OdxLinkRef
        """

        self._length_key_ref = length_key_ref

    @property
    def length_key(self) -> LengthKeyParameterResolved:
        """Gets the length_key of this OdxAny.


        :return: The length_key of this OdxAny.
        :rtype: LengthKeyParameterResolved
        """
        return self._length_key

    @length_key.setter
    def length_key(self, length_key: LengthKeyParameterResolved):
        """Sets the length_key of this OdxAny.


        :param length_key: The length_key of this OdxAny.
        :type length_key: LengthKeyParameterResolved
        """

        self._length_key = length_key

    @property
    def layer_ref(self) -> OdxLinkRef:
        """Gets the layer_ref of this OdxAny.


        :return: The layer_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._layer_ref

    @layer_ref.setter
    def layer_ref(self, layer_ref: OdxLinkRef):
        """Sets the layer_ref of this OdxAny.


        :param layer_ref: The layer_ref of this OdxAny.
        :type layer_ref: OdxLinkRef
        """

        self._layer_ref = layer_ref

    @property
    def not_inherited_diag_comms(self) -> List[str]:
        """Gets the not_inherited_diag_comms of this OdxAny.


        :return: The not_inherited_diag_comms of this OdxAny.
        :rtype: List[str]
        """
        return self._not_inherited_diag_comms

    @not_inherited_diag_comms.setter
    def not_inherited_diag_comms(self, not_inherited_diag_comms: List[str]):
        """Sets the not_inherited_diag_comms of this OdxAny.


        :param not_inherited_diag_comms: The not_inherited_diag_comms of this OdxAny.
        :type not_inherited_diag_comms: List[str]
        """

        self._not_inherited_diag_comms = not_inherited_diag_comms

    @property
    def not_inherited_variables(self) -> List[str]:
        """Gets the not_inherited_variables of this OdxAny.


        :return: The not_inherited_variables of this OdxAny.
        :rtype: List[str]
        """
        return self._not_inherited_variables

    @not_inherited_variables.setter
    def not_inherited_variables(self, not_inherited_variables: List[str]):
        """Sets the not_inherited_variables of this OdxAny.


        :param not_inherited_variables: The not_inherited_variables of this OdxAny.
        :type not_inherited_variables: List[str]
        """

        self._not_inherited_variables = not_inherited_variables

    @property
    def not_inherited_dops(self) -> List[str]:
        """Gets the not_inherited_dops of this OdxAny.


        :return: The not_inherited_dops of this OdxAny.
        :rtype: List[str]
        """
        return self._not_inherited_dops

    @not_inherited_dops.setter
    def not_inherited_dops(self, not_inherited_dops: List[str]):
        """Sets the not_inherited_dops of this OdxAny.


        :param not_inherited_dops: The not_inherited_dops of this OdxAny.
        :type not_inherited_dops: List[str]
        """

        self._not_inherited_dops = not_inherited_dops

    @property
    def not_inherited_tables(self) -> List[str]:
        """Gets the not_inherited_tables of this OdxAny.


        :return: The not_inherited_tables of this OdxAny.
        :rtype: List[str]
        """
        return self._not_inherited_tables

    @not_inherited_tables.setter
    def not_inherited_tables(self, not_inherited_tables: List[str]):
        """Sets the not_inherited_tables of this OdxAny.


        :param not_inherited_tables: The not_inherited_tables of this OdxAny.
        :type not_inherited_tables: List[str]
        """

        self._not_inherited_tables = not_inherited_tables

    @property
    def not_inherited_global_neg_responses(self) -> List[str]:
        """Gets the not_inherited_global_neg_responses of this OdxAny.


        :return: The not_inherited_global_neg_responses of this OdxAny.
        :rtype: List[str]
        """
        return self._not_inherited_global_neg_responses

    @not_inherited_global_neg_responses.setter
    def not_inherited_global_neg_responses(self, not_inherited_global_neg_responses: List[str]):
        """Sets the not_inherited_global_neg_responses of this OdxAny.


        :param not_inherited_global_neg_responses: The not_inherited_global_neg_responses of this OdxAny.
        :type not_inherited_global_neg_responses: List[str]
        """

        self._not_inherited_global_neg_responses = not_inherited_global_neg_responses

    @property
    def layer(self) -> DiagLayer:
        """Gets the layer of this OdxAny.


        :return: The layer of this OdxAny.
        :rtype: DiagLayer
        """
        return self._layer

    @layer.setter
    def layer(self, layer: DiagLayer):
        """Sets the layer of this OdxAny.


        :param layer: The layer of this OdxAny.
        :type layer: DiagLayer
        """

        self._layer = layer

    @property
    def phys_segments(self) -> List[PhysSegment]:
        """Gets the phys_segments of this OdxAny.


        :return: The phys_segments of this OdxAny.
        :rtype: List[PhysSegment]
        """
        return self._phys_segments

    @phys_segments.setter
    def phys_segments(self, phys_segments: List[PhysSegment]):
        """Sets the phys_segments of this OdxAny.


        :param phys_segments: The phys_segments of this OdxAny.
        :type phys_segments: List[PhysSegment]
        """

        self._phys_segments = phys_segments

    @property
    def physical_constant_value(self) -> str:
        """Gets the physical_constant_value of this OdxAny.


        :return: The physical_constant_value of this OdxAny.
        :rtype: str
        """
        return self._physical_constant_value

    @physical_constant_value.setter
    def physical_constant_value(self, physical_constant_value: str):
        """Sets the physical_constant_value of this OdxAny.


        :param physical_constant_value: The physical_constant_value of this OdxAny.
        :type physical_constant_value: str
        """

        self._physical_constant_value = physical_constant_value

    @property
    def length_exp(self) -> int:
        """Gets the length_exp of this OdxAny.


        :return: The length_exp of this OdxAny.
        :rtype: int
        """
        return self._length_exp

    @length_exp.setter
    def length_exp(self, length_exp: int):
        """Sets the length_exp of this OdxAny.


        :param length_exp: The length_exp of this OdxAny.
        :type length_exp: int
        """

        self._length_exp = length_exp

    @property
    def mass_exp(self) -> int:
        """Gets the mass_exp of this OdxAny.


        :return: The mass_exp of this OdxAny.
        :rtype: int
        """
        return self._mass_exp

    @mass_exp.setter
    def mass_exp(self, mass_exp: int):
        """Sets the mass_exp of this OdxAny.


        :param mass_exp: The mass_exp of this OdxAny.
        :type mass_exp: int
        """

        self._mass_exp = mass_exp

    @property
    def time_exp(self) -> int:
        """Gets the time_exp of this OdxAny.


        :return: The time_exp of this OdxAny.
        :rtype: int
        """
        return self._time_exp

    @time_exp.setter
    def time_exp(self, time_exp: int):
        """Sets the time_exp of this OdxAny.


        :param time_exp: The time_exp of this OdxAny.
        :type time_exp: int
        """

        self._time_exp = time_exp

    @property
    def current_exp(self) -> int:
        """Gets the current_exp of this OdxAny.


        :return: The current_exp of this OdxAny.
        :rtype: int
        """
        return self._current_exp

    @current_exp.setter
    def current_exp(self, current_exp: int):
        """Sets the current_exp of this OdxAny.


        :param current_exp: The current_exp of this OdxAny.
        :type current_exp: int
        """

        self._current_exp = current_exp

    @property
    def temperature_exp(self) -> int:
        """Gets the temperature_exp of this OdxAny.


        :return: The temperature_exp of this OdxAny.
        :rtype: int
        """
        return self._temperature_exp

    @temperature_exp.setter
    def temperature_exp(self, temperature_exp: int):
        """Sets the temperature_exp of this OdxAny.


        :param temperature_exp: The temperature_exp of this OdxAny.
        :type temperature_exp: int
        """

        self._temperature_exp = temperature_exp

    @property
    def molar_amount_exp(self) -> int:
        """Gets the molar_amount_exp of this OdxAny.


        :return: The molar_amount_exp of this OdxAny.
        :rtype: int
        """
        return self._molar_amount_exp

    @molar_amount_exp.setter
    def molar_amount_exp(self, molar_amount_exp: int):
        """Sets the molar_amount_exp of this OdxAny.


        :param molar_amount_exp: The molar_amount_exp of this OdxAny.
        :type molar_amount_exp: int
        """

        self._molar_amount_exp = molar_amount_exp

    @property
    def luminous_intensity_exp(self) -> int:
        """Gets the luminous_intensity_exp of this OdxAny.


        :return: The luminous_intensity_exp of this OdxAny.
        :rtype: int
        """
        return self._luminous_intensity_exp

    @luminous_intensity_exp.setter
    def luminous_intensity_exp(self, luminous_intensity_exp: int):
        """Sets the luminous_intensity_exp of this OdxAny.


        :param luminous_intensity_exp: The luminous_intensity_exp of this OdxAny.
        :type luminous_intensity_exp: int
        """

        self._luminous_intensity_exp = luminous_intensity_exp

    @property
    def precision(self) -> int:
        """Gets the precision of this OdxAny.


        :return: The precision of this OdxAny.
        :rtype: int
        """
        return self._precision

    @precision.setter
    def precision(self, precision: int):
        """Sets the precision of this OdxAny.


        :param precision: The precision of this OdxAny.
        :type precision: int
        """

        self._precision = precision

    @property
    def display_radix(self) -> Radix:
        """Gets the display_radix of this OdxAny.


        :return: The display_radix of this OdxAny.
        :rtype: Radix
        """
        return self._display_radix

    @display_radix.setter
    def display_radix(self, display_radix: Radix):
        """Sets the display_radix of this OdxAny.


        :param display_radix: The display_radix of this OdxAny.
        :type display_radix: Radix
        """

        self._display_radix = display_radix

    @property
    def vehicle_connector_pin_refs(self) -> List[OdxLinkRef]:
        """Gets the vehicle_connector_pin_refs of this OdxAny.


        :return: The vehicle_connector_pin_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._vehicle_connector_pin_refs

    @vehicle_connector_pin_refs.setter
    def vehicle_connector_pin_refs(self, vehicle_connector_pin_refs: List[OdxLinkRef]):
        """Sets the vehicle_connector_pin_refs of this OdxAny.


        :param vehicle_connector_pin_refs: The vehicle_connector_pin_refs of this OdxAny.
        :type vehicle_connector_pin_refs: List[OdxLinkRef]
        """

        self._vehicle_connector_pin_refs = vehicle_connector_pin_refs

    @property
    def vehicle_connector_pins(self) -> List[VehicleConnectorPin]:
        """Gets the vehicle_connector_pins of this OdxAny.


        :return: The vehicle_connector_pins of this OdxAny.
        :rtype: List[VehicleConnectorPin]
        """
        return self._vehicle_connector_pins

    @vehicle_connector_pins.setter
    def vehicle_connector_pins(self, vehicle_connector_pins: List[VehicleConnectorPin]):
        """Sets the vehicle_connector_pins of this OdxAny.


        :param vehicle_connector_pins: The vehicle_connector_pins of this OdxAny.
        :type vehicle_connector_pins: List[VehicleConnectorPin]
        """

        self._vehicle_connector_pins = vehicle_connector_pins

    @property
    def positive_offset(self) -> int:
        """Gets the positive_offset of this OdxAny.


        :return: The positive_offset of this OdxAny.
        :rtype: int
        """
        return self._positive_offset

    @positive_offset.setter
    def positive_offset(self, positive_offset: int):
        """Sets the positive_offset of this OdxAny.


        :param positive_offset: The positive_offset of this OdxAny.
        :type positive_offset: int
        """

        self._positive_offset = positive_offset

    @property
    def bit_mask(self) -> int:
        """Gets the bit_mask of this OdxAny.


        :return: The bit_mask of this OdxAny.
        :rtype: int
        """
        return self._bit_mask

    @bit_mask.setter
    def bit_mask(self, bit_mask: int):
        """Sets the bit_mask of this OdxAny.


        :param bit_mask: The bit_mask of this OdxAny.
        :type bit_mask: int
        """

        self._bit_mask = bit_mask

    @property
    def coded_const_snref(self) -> str:
        """Gets the coded_const_snref of this OdxAny.


        :return: The coded_const_snref of this OdxAny.
        :rtype: str
        """
        return self._coded_const_snref

    @coded_const_snref.setter
    def coded_const_snref(self, coded_const_snref: str):
        """Sets the coded_const_snref of this OdxAny.


        :param coded_const_snref: The coded_const_snref of this OdxAny.
        :type coded_const_snref: str
        """

        self._coded_const_snref = coded_const_snref

    @property
    def coded_const_snpathref(self) -> str:
        """Gets the coded_const_snpathref of this OdxAny.


        :return: The coded_const_snpathref of this OdxAny.
        :rtype: str
        """
        return self._coded_const_snpathref

    @coded_const_snpathref.setter
    def coded_const_snpathref(self, coded_const_snpathref: str):
        """Sets the coded_const_snpathref of this OdxAny.


        :param coded_const_snpathref: The coded_const_snpathref of this OdxAny.
        :type coded_const_snpathref: str
        """

        self._coded_const_snpathref = coded_const_snpathref

    @property
    def value_snref(self) -> str:
        """Gets the value_snref of this OdxAny.


        :return: The value_snref of this OdxAny.
        :rtype: str
        """
        return self._value_snref

    @value_snref.setter
    def value_snref(self, value_snref: str):
        """Sets the value_snref of this OdxAny.


        :param value_snref: The value_snref of this OdxAny.
        :type value_snref: str
        """

        self._value_snref = value_snref

    @property
    def value_snpathref(self) -> str:
        """Gets the value_snpathref of this OdxAny.


        :return: The value_snpathref of this OdxAny.
        :rtype: str
        """
        return self._value_snpathref

    @value_snpathref.setter
    def value_snpathref(self, value_snpathref: str):
        """Sets the value_snpathref of this OdxAny.


        :param value_snpathref: The value_snpathref of this OdxAny.
        :type value_snpathref: str
        """

        self._value_snpathref = value_snpathref

    @property
    def phys_const_snref(self) -> str:
        """Gets the phys_const_snref of this OdxAny.


        :return: The phys_const_snref of this OdxAny.
        :rtype: str
        """
        return self._phys_const_snref

    @phys_const_snref.setter
    def phys_const_snref(self, phys_const_snref: str):
        """Sets the phys_const_snref of this OdxAny.


        :param phys_const_snref: The phys_const_snref of this OdxAny.
        :type phys_const_snref: str
        """

        self._phys_const_snref = phys_const_snref

    @property
    def phys_const_snpathref(self) -> str:
        """Gets the phys_const_snpathref of this OdxAny.


        :return: The phys_const_snpathref of this OdxAny.
        :rtype: str
        """
        return self._phys_const_snpathref

    @phys_const_snpathref.setter
    def phys_const_snpathref(self, phys_const_snpathref: str):
        """Sets the phys_const_snpathref of this OdxAny.


        :param phys_const_snpathref: The phys_const_snpathref of this OdxAny.
        :type phys_const_snpathref: str
        """

        self._phys_const_snpathref = phys_const_snpathref

    @property
    def table_key_snref(self) -> str:
        """Gets the table_key_snref of this OdxAny.


        :return: The table_key_snref of this OdxAny.
        :rtype: str
        """
        return self._table_key_snref

    @table_key_snref.setter
    def table_key_snref(self, table_key_snref: str):
        """Sets the table_key_snref of this OdxAny.


        :param table_key_snref: The table_key_snref of this OdxAny.
        :type table_key_snref: str
        """

        self._table_key_snref = table_key_snref

    @property
    def table_key_snpathref(self) -> str:
        """Gets the table_key_snpathref of this OdxAny.


        :return: The table_key_snpathref of this OdxAny.
        :rtype: str
        """
        return self._table_key_snpathref

    @table_key_snpathref.setter
    def table_key_snpathref(self, table_key_snpathref: str):
        """Sets the table_key_snpathref of this OdxAny.


        :param table_key_snpathref: The table_key_snpathref of this OdxAny.
        :type table_key_snpathref: str
        """

        self._table_key_snpathref = table_key_snpathref

    @property
    def in_param_if_snpathref(self) -> str:
        """Gets the in_param_if_snpathref of this OdxAny.


        :return: The in_param_if_snpathref of this OdxAny.
        :rtype: str
        """
        return self._in_param_if_snpathref

    @in_param_if_snpathref.setter
    def in_param_if_snpathref(self, in_param_if_snpathref: str):
        """Sets the in_param_if_snpathref of this OdxAny.


        :param in_param_if_snpathref: The in_param_if_snpathref of this OdxAny.
        :type in_param_if_snpathref: str
        """

        self._in_param_if_snpathref = in_param_if_snpathref

    @property
    def library_refs(self) -> List[OdxLinkRef]:
        """Gets the library_refs of this OdxAny.


        :return: The library_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._library_refs

    @library_refs.setter
    def library_refs(self, library_refs: List[OdxLinkRef]):
        """Sets the library_refs of this OdxAny.


        :param library_refs: The library_refs of this OdxAny.
        :type library_refs: List[OdxLinkRef]
        """

        self._library_refs = library_refs

    @property
    def pdu_protocol_type(self) -> str:
        """Gets the pdu_protocol_type of this OdxAny.


        :return: The pdu_protocol_type of this OdxAny.
        :rtype: str
        """
        return self._pdu_protocol_type

    @pdu_protocol_type.setter
    def pdu_protocol_type(self, pdu_protocol_type: str):
        """Sets the pdu_protocol_type of this OdxAny.


        :param pdu_protocol_type: The pdu_protocol_type of this OdxAny.
        :type pdu_protocol_type: str
        """

        self._pdu_protocol_type = pdu_protocol_type

    @property
    def physical_link_type(self) -> str:
        """Gets the physical_link_type of this OdxAny.


        :return: The physical_link_type of this OdxAny.
        :rtype: str
        """
        return self._physical_link_type

    @physical_link_type.setter
    def physical_link_type(self, physical_link_type: str):
        """Sets the physical_link_type of this OdxAny.


        :param physical_link_type: The physical_link_type of this OdxAny.
        :type physical_link_type: str
        """

        self._physical_link_type = physical_link_type

    @property
    def comparam_subset_refs(self) -> List[OdxLinkRef]:
        """Gets the comparam_subset_refs of this OdxAny.


        :return: The comparam_subset_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._comparam_subset_refs

    @comparam_subset_refs.setter
    def comparam_subset_refs(self, comparam_subset_refs: List[OdxLinkRef]):
        """Sets the comparam_subset_refs of this OdxAny.


        :param comparam_subset_refs: The comparam_subset_refs of this OdxAny.
        :type comparam_subset_refs: List[OdxLinkRef]
        """

        self._comparam_subset_refs = comparam_subset_refs

    @property
    def comparam_subsets(self) -> List[ComparamSubset]:
        """Gets the comparam_subsets of this OdxAny.


        :return: The comparam_subsets of this OdxAny.
        :rtype: List[ComparamSubset]
        """
        return self._comparam_subsets

    @comparam_subsets.setter
    def comparam_subsets(self, comparam_subsets: List[ComparamSubset]):
        """Sets the comparam_subsets of this OdxAny.


        :param comparam_subsets: The comparam_subsets of this OdxAny.
        :type comparam_subsets: List[ComparamSubset]
        """

        self._comparam_subsets = comparam_subsets

    @property
    def comparam_spec_ref(self) -> OdxLinkRef:
        """Gets the comparam_spec_ref of this OdxAny.


        :return: The comparam_spec_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._comparam_spec_ref

    @comparam_spec_ref.setter
    def comparam_spec_ref(self, comparam_spec_ref: OdxLinkRef):
        """Sets the comparam_spec_ref of this OdxAny.


        :param comparam_spec_ref: The comparam_spec_ref of this OdxAny.
        :type comparam_spec_ref: OdxLinkRef
        """

        self._comparam_spec_ref = comparam_spec_ref

    @property
    def comparam_spec(self) -> ComparamSpec:
        """Gets the comparam_spec of this OdxAny.


        :return: The comparam_spec of this OdxAny.
        :rtype: ComparamSpec
        """
        return self._comparam_spec

    @comparam_spec.setter
    def comparam_spec(self, comparam_spec: ComparamSpec):
        """Sets the comparam_spec of this OdxAny.


        :param comparam_spec: The comparam_spec of this OdxAny.
        :type comparam_spec: ComparamSpec
        """

        self._comparam_spec = comparam_spec

    @property
    def numerator_coeffs(self) -> List[CompuRationalCoeffsNumeratorsInner]:
        """Gets the numerator_coeffs of this OdxAny.


        :return: The numerator_coeffs of this OdxAny.
        :rtype: List[CompuRationalCoeffsNumeratorsInner]
        """
        return self._numerator_coeffs

    @numerator_coeffs.setter
    def numerator_coeffs(self, numerator_coeffs: List[CompuRationalCoeffsNumeratorsInner]):
        """Sets the numerator_coeffs of this OdxAny.


        :param numerator_coeffs: The numerator_coeffs of this OdxAny.
        :type numerator_coeffs: List[CompuRationalCoeffsNumeratorsInner]
        """

        self._numerator_coeffs = numerator_coeffs

    @property
    def denominator_coeffs(self) -> List[CompuRationalCoeffsNumeratorsInner]:
        """Gets the denominator_coeffs of this OdxAny.


        :return: The denominator_coeffs of this OdxAny.
        :rtype: List[CompuRationalCoeffsNumeratorsInner]
        """
        return self._denominator_coeffs

    @denominator_coeffs.setter
    def denominator_coeffs(self, denominator_coeffs: List[CompuRationalCoeffsNumeratorsInner]):
        """Sets the denominator_coeffs of this OdxAny.


        :param denominator_coeffs: The denominator_coeffs of this OdxAny.
        :type denominator_coeffs: List[CompuRationalCoeffsNumeratorsInner]
        """

        self._denominator_coeffs = denominator_coeffs

    @property
    def read_param_values(self) -> List[ReadParamValue]:
        """Gets the read_param_values of this OdxAny.


        :return: The read_param_values of this OdxAny.
        :rtype: List[ReadParamValue]
        """
        return self._read_param_values

    @read_param_values.setter
    def read_param_values(self, read_param_values: List[ReadParamValue]):
        """Sets the read_param_values of this OdxAny.


        :param read_param_values: The read_param_values of this OdxAny.
        :type read_param_values: List[ReadParamValue]
        """

        self._read_param_values = read_param_values

    @property
    def read_diag_comm_ref(self) -> OdxLinkRef:
        """Gets the read_diag_comm_ref of this OdxAny.


        :return: The read_diag_comm_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._read_diag_comm_ref

    @read_diag_comm_ref.setter
    def read_diag_comm_ref(self, read_diag_comm_ref: OdxLinkRef):
        """Sets the read_diag_comm_ref of this OdxAny.


        :param read_diag_comm_ref: The read_diag_comm_ref of this OdxAny.
        :type read_diag_comm_ref: OdxLinkRef
        """

        self._read_diag_comm_ref = read_diag_comm_ref

    @property
    def read_diag_comm_snref(self) -> str:
        """Gets the read_diag_comm_snref of this OdxAny.


        :return: The read_diag_comm_snref of this OdxAny.
        :rtype: str
        """
        return self._read_diag_comm_snref

    @read_diag_comm_snref.setter
    def read_diag_comm_snref(self, read_diag_comm_snref: str):
        """Sets the read_diag_comm_snref of this OdxAny.


        :param read_diag_comm_snref: The read_diag_comm_snref of this OdxAny.
        :type read_diag_comm_snref: str
        """

        self._read_diag_comm_snref = read_diag_comm_snref

    @property
    def read_data_snref(self) -> str:
        """Gets the read_data_snref of this OdxAny.


        :return: The read_data_snref of this OdxAny.
        :rtype: str
        """
        return self._read_data_snref

    @read_data_snref.setter
    def read_data_snref(self, read_data_snref: str):
        """Sets the read_data_snref of this OdxAny.


        :param read_data_snref: The read_data_snref of this OdxAny.
        :type read_data_snref: str
        """

        self._read_data_snref = read_data_snref

    @property
    def read_data_snpathref(self) -> str:
        """Gets the read_data_snpathref of this OdxAny.


        :return: The read_data_snpathref of this OdxAny.
        :rtype: str
        """
        return self._read_data_snpathref

    @read_data_snpathref.setter
    def read_data_snpathref(self, read_data_snpathref: str):
        """Sets the read_data_snpathref of this OdxAny.


        :param read_data_snpathref: The read_data_snpathref of this OdxAny.
        :type read_data_snpathref: str
        """

        self._read_data_snpathref = read_data_snpathref

    @property
    def read_diag_comm(self) -> DiagComm:
        """Gets the read_diag_comm of this OdxAny.


        :return: The read_diag_comm of this OdxAny.
        :rtype: DiagComm
        """
        return self._read_diag_comm

    @read_diag_comm.setter
    def read_diag_comm(self, read_diag_comm: DiagComm):
        """Sets the read_diag_comm of this OdxAny.


        :param read_diag_comm: The read_diag_comm of this OdxAny.
        :type read_diag_comm: DiagComm
        """

        self._read_diag_comm = read_diag_comm

    @property
    def xdoc(self) -> XDoc:
        """Gets the xdoc of this OdxAny.


        :return: The xdoc of this OdxAny.
        :rtype: XDoc
        """
        return self._xdoc

    @xdoc.setter
    def xdoc(self, xdoc: XDoc):
        """Sets the xdoc of this OdxAny.


        :param xdoc: The xdoc of this OdxAny.
        :type xdoc: XDoc
        """

        self._xdoc = xdoc

    @property
    def response_type(self) -> ResponseType:
        """Gets the response_type of this OdxAny.


        :return: The response_type of this OdxAny.
        :rtype: ResponseType
        """
        return self._response_type

    @response_type.setter
    def response_type(self, response_type: ResponseType):
        """Sets the response_type of this OdxAny.


        :param response_type: The response_type of this OdxAny.
        :type response_type: ResponseType
        """

        self._response_type = response_type

    @property
    def validity(self) -> ValidType:
        """Gets the validity of this OdxAny.


        :return: The validity of this OdxAny.
        :rtype: ValidType
        """
        return self._validity

    @validity.setter
    def validity(self, validity: ValidType):
        """Sets the validity of this OdxAny.


        :param validity: The validity of this OdxAny.
        :type validity: ValidType
        """

        self._validity = validity

    @property
    def security_method(self) -> ValidityFor:
        """Gets the security_method of this OdxAny.


        :return: The security_method of this OdxAny.
        :rtype: ValidityFor
        """
        return self._security_method

    @security_method.setter
    def security_method(self, security_method: ValidityFor):
        """Sets the security_method of this OdxAny.


        :param security_method: The security_method of this OdxAny.
        :type security_method: ValidityFor
        """

        self._security_method = security_method

    @property
    def fw_signature(self) -> ValidityFor:
        """Gets the fw_signature of this OdxAny.


        :return: The fw_signature of this OdxAny.
        :rtype: ValidityFor
        """
        return self._fw_signature

    @fw_signature.setter
    def fw_signature(self, fw_signature: ValidityFor):
        """Sets the fw_signature of this OdxAny.


        :param fw_signature: The fw_signature of this OdxAny.
        :type fw_signature: ValidityFor
        """

        self._fw_signature = fw_signature

    @property
    def fw_checksum(self) -> ValidityFor:
        """Gets the fw_checksum of this OdxAny.


        :return: The fw_checksum of this OdxAny.
        :rtype: ValidityFor
        """
        return self._fw_checksum

    @fw_checksum.setter
    def fw_checksum(self, fw_checksum: ValidityFor):
        """Sets the fw_checksum of this OdxAny.


        :param fw_checksum: The fw_checksum of this OdxAny.
        :type fw_checksum: ValidityFor
        """

        self._fw_checksum = fw_checksum

    @property
    def validity_for(self) -> ValidityFor:
        """Gets the validity_for of this OdxAny.


        :return: The validity_for of this OdxAny.
        :rtype: ValidityFor
        """
        return self._validity_for

    @validity_for.setter
    def validity_for(self, validity_for: ValidityFor):
        """Sets the validity_for of this OdxAny.


        :param validity_for: The validity_for of this OdxAny.
        :type validity_for: ValidityFor
        """

        self._validity_for = validity_for

    @property
    def expected_idents(self) -> List[ExpectedIdent]:
        """Gets the expected_idents of this OdxAny.


        :return: The expected_idents of this OdxAny.
        :rtype: List[ExpectedIdent]
        """
        return self._expected_idents

    @expected_idents.setter
    def expected_idents(self, expected_idents: List[ExpectedIdent]):
        """Sets the expected_idents of this OdxAny.


        :param expected_idents: The expected_idents of this OdxAny.
        :type expected_idents: List[ExpectedIdent]
        """

        self._expected_idents = expected_idents

    @property
    def checksums(self) -> List[Checksum]:
        """Gets the checksums of this OdxAny.


        :return: The checksums of this OdxAny.
        :rtype: List[Checksum]
        """
        return self._checksums

    @checksums.setter
    def checksums(self, checksums: List[Checksum]):
        """Sets the checksums of this OdxAny.


        :param checksums: The checksums of this OdxAny.
        :type checksums: List[Checksum]
        """

        self._checksums = checksums

    @property
    def datablock_refs(self) -> List[OdxLinkRef]:
        """Gets the datablock_refs of this OdxAny.


        :return: The datablock_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._datablock_refs

    @datablock_refs.setter
    def datablock_refs(self, datablock_refs: List[OdxLinkRef]):
        """Sets the datablock_refs of this OdxAny.


        :param datablock_refs: The datablock_refs of this OdxAny.
        :type datablock_refs: List[OdxLinkRef]
        """

        self._datablock_refs = datablock_refs

    @property
    def partnumber(self) -> str:
        """Gets the partnumber of this OdxAny.


        :return: The partnumber of this OdxAny.
        :rtype: str
        """
        return self._partnumber

    @partnumber.setter
    def partnumber(self, partnumber: str):
        """Sets the partnumber of this OdxAny.


        :param partnumber: The partnumber of this OdxAny.
        :type partnumber: str
        """

        self._partnumber = partnumber

    @property
    def priority(self) -> int:
        """Gets the priority of this OdxAny.


        :return: The priority of this OdxAny.
        :rtype: int
        """
        return self._priority

    @priority.setter
    def priority(self, priority: int):
        """Sets the priority of this OdxAny.


        :param priority: The priority of this OdxAny.
        :type priority: int
        """

        self._priority = priority

    @property
    def session_snref(self) -> str:
        """Gets the session_snref of this OdxAny.


        :return: The session_snref of this OdxAny.
        :rtype: str
        """
        return self._session_snref

    @session_snref.setter
    def session_snref(self, session_snref: str):
        """Sets the session_snref of this OdxAny.


        :param session_snref: The session_snref of this OdxAny.
        :type session_snref: str
        """

        self._session_snref = session_snref

    @property
    def flash_class_refs(self) -> List[OdxLinkRef]:
        """Gets the flash_class_refs of this OdxAny.


        :return: The flash_class_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._flash_class_refs

    @flash_class_refs.setter
    def flash_class_refs(self, flash_class_refs: List[OdxLinkRef]):
        """Sets the flash_class_refs of this OdxAny.


        :param flash_class_refs: The flash_class_refs of this OdxAny.
        :type flash_class_refs: List[OdxLinkRef]
        """

        self._flash_class_refs = flash_class_refs

    @property
    def own_ident(self) -> OwnIdent:
        """Gets the own_ident of this OdxAny.


        :return: The own_ident of this OdxAny.
        :rtype: OwnIdent
        """
        return self._own_ident

    @own_ident.setter
    def own_ident(self, own_ident: OwnIdent):
        """Sets the own_ident of this OdxAny.


        :param own_ident: The own_ident of this OdxAny.
        :type own_ident: OwnIdent
        """

        self._own_ident = own_ident

    @property
    def direction(self) -> Direction:
        """Gets the direction of this OdxAny.


        :return: The direction of this OdxAny.
        :rtype: Direction
        """
        return self._direction

    @direction.setter
    def direction(self, direction: Direction):
        """Sets the direction of this OdxAny.


        :param direction: The direction of this OdxAny.
        :type direction: Direction
        """

        self._direction = direction

    @property
    def filter_size(self) -> int:
        """Gets the filter_size of this OdxAny.


        :return: The filter_size of this OdxAny.
        :rtype: int
        """
        return self._filter_size

    @filter_size.setter
    def filter_size(self, filter_size: int):
        """Sets the filter_size of this OdxAny.


        :param filter_size: The filter_size of this OdxAny.
        :type filter_size: int
        """

        self._filter_size = filter_size

    @property
    def size(self) -> int:
        """Gets the size of this OdxAny.


        :return: The size of this OdxAny.
        :rtype: int
        """
        return self._size

    @size.setter
    def size(self, size: int):
        """Sets the size of this OdxAny.


        :param size: The size of this OdxAny.
        :type size: int
        """

        self._size = size

    @property
    def semantic_info(self) -> str:
        """Gets the semantic_info of this OdxAny.


        :return: The semantic_info of this OdxAny.
        :rtype: str
        """
        return self._semantic_info

    @semantic_info.setter
    def semantic_info(self, semantic_info: str):
        """Sets the semantic_info of this OdxAny.


        :param semantic_info: The semantic_info of this OdxAny.
        :type semantic_info: str
        """

        self._semantic_info = semantic_info

    @property
    def sdg_caption(self) -> SpecialDataGroupCaption:
        """Gets the sdg_caption of this OdxAny.


        :return: The sdg_caption of this OdxAny.
        :rtype: SpecialDataGroupCaption
        """
        return self._sdg_caption

    @sdg_caption.setter
    def sdg_caption(self, sdg_caption: SpecialDataGroupCaption):
        """Sets the sdg_caption of this OdxAny.


        :param sdg_caption: The sdg_caption of this OdxAny.
        :type sdg_caption: SpecialDataGroupCaption
        """

        self._sdg_caption = sdg_caption

    @property
    def sdg_caption_ref(self) -> OdxLinkRef:
        """Gets the sdg_caption_ref of this OdxAny.


        :return: The sdg_caption_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._sdg_caption_ref

    @sdg_caption_ref.setter
    def sdg_caption_ref(self, sdg_caption_ref: OdxLinkRef):
        """Sets the sdg_caption_ref of this OdxAny.


        :param sdg_caption_ref: The sdg_caption_ref of this OdxAny.
        :type sdg_caption_ref: OdxLinkRef
        """

        self._sdg_caption_ref = sdg_caption_ref

    @property
    def values(self) -> List[SpecialDataGroupValuesInner]:
        """Gets the values of this OdxAny.


        :return: The values of this OdxAny.
        :rtype: List[SpecialDataGroupValuesInner]
        """
        return self._values

    @values.setter
    def values(self, values: List[SpecialDataGroupValuesInner]):
        """Sets the values of this OdxAny.


        :param values: The values of this OdxAny.
        :type values: List[SpecialDataGroupValuesInner]
        """

        self._values = values

    @property
    def is_condensed_raw(self) -> bool:
        """Gets the is_condensed_raw of this OdxAny.


        :return: The is_condensed_raw of this OdxAny.
        :rtype: bool
        """
        return self._is_condensed_raw

    @is_condensed_raw.setter
    def is_condensed_raw(self, is_condensed_raw: bool):
        """Sets the is_condensed_raw of this OdxAny.


        :param is_condensed_raw: The is_condensed_raw of this OdxAny.
        :type is_condensed_raw: bool
        """

        self._is_condensed_raw = is_condensed_raw

    @property
    def is_condensed(self) -> bool:
        """Gets the is_condensed of this OdxAny.


        :return: The is_condensed of this OdxAny.
        :rtype: bool
        """
        return self._is_condensed

    @is_condensed.setter
    def is_condensed(self, is_condensed: bool):
        """Sets the is_condensed of this OdxAny.


        :param is_condensed: The is_condensed of this OdxAny.
        :type is_condensed: bool
        """

        self._is_condensed = is_condensed

    @property
    def start_state_snref(self) -> str:
        """Gets the start_state_snref of this OdxAny.


        :return: The start_state_snref of this OdxAny.
        :rtype: str
        """
        return self._start_state_snref

    @start_state_snref.setter
    def start_state_snref(self, start_state_snref: str):
        """Sets the start_state_snref of this OdxAny.


        :param start_state_snref: The start_state_snref of this OdxAny.
        :type start_state_snref: str
        """

        self._start_state_snref = start_state_snref

    @property
    def states(self) -> List[State]:
        """Gets the states of this OdxAny.


        :return: The states of this OdxAny.
        :rtype: List[State]
        """
        return self._states

    @states.setter
    def states(self, states: List[State]):
        """Sets the states of this OdxAny.


        :param states: The states of this OdxAny.
        :type states: List[State]
        """

        self._states = states

    @property
    def start_state(self) -> State:
        """Gets the start_state of this OdxAny.


        :return: The start_state of this OdxAny.
        :rtype: State
        """
        return self._start_state

    @start_state.setter
    def start_state(self, start_state: State):
        """Sets the start_state of this OdxAny.


        :param start_state: The start_state of this OdxAny.
        :type start_state: State
        """

        self._start_state = start_state

    @property
    def succeeded(self) -> bool:
        """Gets the succeeded of this OdxAny.


        :return: The succeeded of this OdxAny.
        :rtype: bool
        """
        return self._succeeded

    @succeeded.setter
    def succeeded(self, succeeded: bool):
        """Sets the succeeded of this OdxAny.


        :param succeeded: The succeeded of this OdxAny.
        :type succeeded: bool
        """

        self._succeeded = succeeded

    @property
    def source_snref(self) -> str:
        """Gets the source_snref of this OdxAny.


        :return: The source_snref of this OdxAny.
        :rtype: str
        """
        return self._source_snref

    @source_snref.setter
    def source_snref(self, source_snref: str):
        """Sets the source_snref of this OdxAny.


        :param source_snref: The source_snref of this OdxAny.
        :type source_snref: str
        """

        self._source_snref = source_snref

    @property
    def target_snref(self) -> str:
        """Gets the target_snref of this OdxAny.


        :return: The target_snref of this OdxAny.
        :rtype: str
        """
        return self._target_snref

    @target_snref.setter
    def target_snref(self, target_snref: str):
        """Sets the target_snref of this OdxAny.


        :param target_snref: The target_snref of this OdxAny.
        :type target_snref: str
        """

        self._target_snref = target_snref

    @property
    def external_access_method(self) -> ExternalAccessMethod:
        """Gets the external_access_method of this OdxAny.


        :return: The external_access_method of this OdxAny.
        :rtype: ExternalAccessMethod
        """
        return self._external_access_method

    @external_access_method.setter
    def external_access_method(self, external_access_method: ExternalAccessMethod):
        """Sets the external_access_method of this OdxAny.


        :param external_access_method: The external_access_method of this OdxAny.
        :type external_access_method: ExternalAccessMethod
        """

        self._external_access_method = external_access_method

    @property
    def fixed_number_of_items(self) -> int:
        """Gets the fixed_number_of_items of this OdxAny.


        :return: The fixed_number_of_items of this OdxAny.
        :rtype: int
        """
        return self._fixed_number_of_items

    @fixed_number_of_items.setter
    def fixed_number_of_items(self, fixed_number_of_items: int):
        """Sets the fixed_number_of_items of this OdxAny.


        :param fixed_number_of_items: The fixed_number_of_items of this OdxAny.
        :type fixed_number_of_items: int
        """

        self._fixed_number_of_items = fixed_number_of_items

    @property
    def item_byte_size(self) -> int:
        """Gets the item_byte_size of this OdxAny.


        :return: The item_byte_size of this OdxAny.
        :rtype: int
        """
        return self._item_byte_size

    @item_byte_size.setter
    def item_byte_size(self, item_byte_size: int):
        """Sets the item_byte_size of this OdxAny.


        :param item_byte_size: The item_byte_size of this OdxAny.
        :type item_byte_size: int
        """

        self._item_byte_size = item_byte_size

    @property
    def sub_component_patterns(self) -> List[SubComponentPattern]:
        """Gets the sub_component_patterns of this OdxAny.


        :return: The sub_component_patterns of this OdxAny.
        :rtype: List[SubComponentPattern]
        """
        return self._sub_component_patterns

    @sub_component_patterns.setter
    def sub_component_patterns(self, sub_component_patterns: List[SubComponentPattern]):
        """Sets the sub_component_patterns of this OdxAny.


        :param sub_component_patterns: The sub_component_patterns of this OdxAny.
        :type sub_component_patterns: List[SubComponentPattern]
        """

        self._sub_component_patterns = sub_component_patterns

    @property
    def sub_component_param_connectors(self) -> List[SubComponentParamConnector]:
        """Gets the sub_component_param_connectors of this OdxAny.


        :return: The sub_component_param_connectors of this OdxAny.
        :rtype: List[SubComponentParamConnector]
        """
        return self._sub_component_param_connectors

    @sub_component_param_connectors.setter
    def sub_component_param_connectors(self, sub_component_param_connectors: List[SubComponentParamConnector]):
        """Sets the sub_component_param_connectors of this OdxAny.


        :param sub_component_param_connectors: The sub_component_param_connectors of this OdxAny.
        :type sub_component_param_connectors: List[SubComponentParamConnector]
        """

        self._sub_component_param_connectors = sub_component_param_connectors

    @property
    def out_param_if_refs(self) -> List[str]:
        """Gets the out_param_if_refs of this OdxAny.


        :return: The out_param_if_refs of this OdxAny.
        :rtype: List[str]
        """
        return self._out_param_if_refs

    @out_param_if_refs.setter
    def out_param_if_refs(self, out_param_if_refs: List[str]):
        """Sets the out_param_if_refs of this OdxAny.


        :param out_param_if_refs: The out_param_if_refs of this OdxAny.
        :type out_param_if_refs: List[str]
        """

        self._out_param_if_refs = out_param_if_refs

    @property
    def in_param_if_refs(self) -> List[str]:
        """Gets the in_param_if_refs of this OdxAny.


        :return: The in_param_if_refs of this OdxAny.
        :rtype: List[str]
        """
        return self._in_param_if_refs

    @in_param_if_refs.setter
    def in_param_if_refs(self, in_param_if_refs: List[str]):
        """Sets the in_param_if_refs of this OdxAny.


        :param in_param_if_refs: The in_param_if_refs of this OdxAny.
        :type in_param_if_refs: List[str]
        """

        self._in_param_if_refs = in_param_if_refs

    @property
    def out_param_ifs(self) -> List[Parameter]:
        """Gets the out_param_ifs of this OdxAny.


        :return: The out_param_ifs of this OdxAny.
        :rtype: List[Parameter]
        """
        return self._out_param_ifs

    @out_param_ifs.setter
    def out_param_ifs(self, out_param_ifs: List[Parameter]):
        """Sets the out_param_ifs of this OdxAny.


        :param out_param_ifs: The out_param_ifs of this OdxAny.
        :type out_param_ifs: List[Parameter]
        """

        self._out_param_ifs = out_param_ifs

    @property
    def in_param_ifs(self) -> List[Parameter]:
        """Gets the in_param_ifs of this OdxAny.


        :return: The in_param_ifs of this OdxAny.
        :rtype: List[Parameter]
        """
        return self._in_param_ifs

    @in_param_ifs.setter
    def in_param_ifs(self, in_param_ifs: List[Parameter]):
        """Sets the in_param_ifs of this OdxAny.


        :param in_param_ifs: The in_param_ifs of this OdxAny.
        :type in_param_ifs: List[Parameter]
        """

        self._in_param_ifs = in_param_ifs

    @property
    def origin(self) -> str:
        """Gets the origin of this OdxAny.


        :return: The origin of this OdxAny.
        :rtype: str
        """
        return self._origin

    @origin.setter
    def origin(self, origin: str):
        """Sets the origin of this OdxAny.


        :param origin: The origin of this OdxAny.
        :type origin: str
        """

        self._origin = origin

    @property
    def sysparam(self) -> str:
        """Gets the sysparam of this OdxAny.


        :return: The sysparam of this OdxAny.
        :rtype: str
        """
        return self._sysparam

    @sysparam.setter
    def sysparam(self, sysparam: str):
        """Sets the sysparam of this OdxAny.


        :param sysparam: The sysparam of this OdxAny.
        :type sysparam: str
        """

        self._sysparam = sysparam

    @property
    def key_label(self) -> str:
        """Gets the key_label of this OdxAny.


        :return: The key_label of this OdxAny.
        :rtype: str
        """
        return self._key_label

    @key_label.setter
    def key_label(self, key_label: str):
        """Sets the key_label of this OdxAny.


        :param key_label: The key_label of this OdxAny.
        :type key_label: str
        """

        self._key_label = key_label

    @property
    def struct_label(self) -> str:
        """Gets the struct_label of this OdxAny.


        :return: The struct_label of this OdxAny.
        :rtype: str
        """
        return self._struct_label

    @struct_label.setter
    def struct_label(self, struct_label: str):
        """Sets the struct_label of this OdxAny.


        :param struct_label: The struct_label of this OdxAny.
        :type struct_label: str
        """

        self._struct_label = struct_label

    @property
    def key_dop_ref(self) -> OdxLinkRef:
        """Gets the key_dop_ref of this OdxAny.


        :return: The key_dop_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._key_dop_ref

    @key_dop_ref.setter
    def key_dop_ref(self, key_dop_ref: OdxLinkRef):
        """Sets the key_dop_ref of this OdxAny.


        :param key_dop_ref: The key_dop_ref of this OdxAny.
        :type key_dop_ref: OdxLinkRef
        """

        self._key_dop_ref = key_dop_ref

    @property
    def table_rows_raw(self) -> List[TableTableRowsRawInner]:
        """Gets the table_rows_raw of this OdxAny.


        :return: The table_rows_raw of this OdxAny.
        :rtype: List[TableTableRowsRawInner]
        """
        return self._table_rows_raw

    @table_rows_raw.setter
    def table_rows_raw(self, table_rows_raw: List[TableTableRowsRawInner]):
        """Sets the table_rows_raw of this OdxAny.


        :param table_rows_raw: The table_rows_raw of this OdxAny.
        :type table_rows_raw: List[TableTableRowsRawInner]
        """

        self._table_rows_raw = table_rows_raw

    @property
    def table_rows(self) -> List[TableRow]:
        """Gets the table_rows of this OdxAny.


        :return: The table_rows of this OdxAny.
        :rtype: List[TableRow]
        """
        return self._table_rows

    @table_rows.setter
    def table_rows(self, table_rows: List[TableRow]):
        """Sets the table_rows of this OdxAny.


        :param table_rows: The table_rows of this OdxAny.
        :type table_rows: List[TableRow]
        """

        self._table_rows = table_rows

    @property
    def table_diag_comm_connectors(self) -> List[TableDiagCommConnector]:
        """Gets the table_diag_comm_connectors of this OdxAny.


        :return: The table_diag_comm_connectors of this OdxAny.
        :rtype: List[TableDiagCommConnector]
        """
        return self._table_diag_comm_connectors

    @table_diag_comm_connectors.setter
    def table_diag_comm_connectors(self, table_diag_comm_connectors: List[TableDiagCommConnector]):
        """Sets the table_diag_comm_connectors of this OdxAny.


        :param table_diag_comm_connectors: The table_diag_comm_connectors of this OdxAny.
        :type table_diag_comm_connectors: List[TableDiagCommConnector]
        """

        self._table_diag_comm_connectors = table_diag_comm_connectors

    @property
    def target(self) -> RowFragment:
        """Gets the target of this OdxAny.


        :return: The target of this OdxAny.
        :rtype: RowFragment
        """
        return self._target

    @target.setter
    def target(self, target: RowFragment):
        """Sets the target of this OdxAny.


        :param target: The target of this OdxAny.
        :type target: RowFragment
        """

        self._target = target

    @property
    def table_row_ref(self) -> OdxLinkRef:
        """Gets the table_row_ref of this OdxAny.


        :return: The table_row_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._table_row_ref

    @table_row_ref.setter
    def table_row_ref(self, table_row_ref: OdxLinkRef):
        """Sets the table_row_ref of this OdxAny.


        :param table_row_ref: The table_row_ref of this OdxAny.
        :type table_row_ref: OdxLinkRef
        """

        self._table_row_ref = table_row_ref

    @property
    def table_ref(self) -> OdxLinkRef:
        """Gets the table_ref of this OdxAny.


        :return: The table_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._table_ref

    @table_ref.setter
    def table_ref(self, table_ref: OdxLinkRef):
        """Sets the table_ref of this OdxAny.


        :param table_ref: The table_ref of this OdxAny.
        :type table_ref: OdxLinkRef
        """

        self._table_ref = table_ref

    @property
    def key_dop(self) -> DataObjectProperty:
        """Gets the key_dop of this OdxAny.


        :return: The key_dop of this OdxAny.
        :rtype: DataObjectProperty
        """
        return self._key_dop

    @key_dop.setter
    def key_dop(self, key_dop: DataObjectProperty):
        """Sets the key_dop of this OdxAny.


        :param key_dop: The key_dop of this OdxAny.
        :type key_dop: DataObjectProperty
        """

        self._key_dop = key_dop

    @property
    def key_raw(self) -> str:
        """Gets the key_raw of this OdxAny.


        :return: The key_raw of this OdxAny.
        :rtype: str
        """
        return self._key_raw

    @key_raw.setter
    def key_raw(self, key_raw: str):
        """Sets the key_raw of this OdxAny.


        :param key_raw: The key_raw of this OdxAny.
        :type key_raw: str
        """

        self._key_raw = key_raw

    @property
    def table_key_ref(self) -> OdxLinkRef:
        """Gets the table_key_ref of this OdxAny.


        :return: The table_key_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._table_key_ref

    @table_key_ref.setter
    def table_key_ref(self, table_key_ref: OdxLinkRef):
        """Sets the table_key_ref of this OdxAny.


        :param table_key_ref: The table_key_ref of this OdxAny.
        :type table_key_ref: OdxLinkRef
        """

        self._table_key_ref = table_key_ref

    @property
    def table_key(self) -> TableKeyParameterResolved:
        """Gets the table_key of this OdxAny.


        :return: The table_key of this OdxAny.
        :rtype: TableKeyParameterResolved
        """
        return self._table_key

    @table_key.setter
    def table_key(self, table_key: TableKeyParameterResolved):
        """Sets the table_key of this OdxAny.


        :param table_key: The table_key of this OdxAny.
        :type table_key: TableKeyParameterResolved
        """

        self._table_key = table_key

    @property
    def department(self) -> str:
        """Gets the department of this OdxAny.


        :return: The department of this OdxAny.
        :rtype: str
        """
        return self._department

    @department.setter
    def department(self, department: str):
        """Sets the department of this OdxAny.


        :param department: The department of this OdxAny.
        :type department: str
        """

        self._department = department

    @property
    def address(self) -> str:
        """Gets the address of this OdxAny.


        :return: The address of this OdxAny.
        :rtype: str
        """
        return self._address

    @address.setter
    def address(self, address: str):
        """Sets the address of this OdxAny.


        :param address: The address of this OdxAny.
        :type address: str
        """

        self._address = address

    @property
    def zipcode(self) -> str:
        """Gets the zipcode of this OdxAny.


        :return: The zipcode of this OdxAny.
        :rtype: str
        """
        return self._zipcode

    @zipcode.setter
    def zipcode(self, zipcode: str):
        """Sets the zipcode of this OdxAny.


        :param zipcode: The zipcode of this OdxAny.
        :type zipcode: str
        """

        self._zipcode = zipcode

    @property
    def city(self) -> str:
        """Gets the city of this OdxAny.


        :return: The city of this OdxAny.
        :rtype: str
        """
        return self._city

    @city.setter
    def city(self, city: str):
        """Sets the city of this OdxAny.


        :param city: The city of this OdxAny.
        :type city: str
        """

        self._city = city

    @property
    def phone(self) -> str:
        """Gets the phone of this OdxAny.


        :return: The phone of this OdxAny.
        :rtype: str
        """
        return self._phone

    @phone.setter
    def phone(self, phone: str):
        """Sets the phone of this OdxAny.


        :param phone: The phone of this OdxAny.
        :type phone: str
        """

        self._phone = phone

    @property
    def fax(self) -> str:
        """Gets the fax of this OdxAny.


        :return: The fax of this OdxAny.
        :rtype: str
        """
        return self._fax

    @fax.setter
    def fax(self, fax: str):
        """Sets the fax of this OdxAny.


        :param fax: The fax of this OdxAny.
        :type fax: str
        """

        self._fax = fax

    @property
    def email(self) -> str:
        """Gets the email of this OdxAny.


        :return: The email of this OdxAny.
        :rtype: str
        """
        return self._email

    @email.setter
    def email(self, email: str):
        """Sets the email of this OdxAny.


        :param email: The email of this OdxAny.
        :type email: str
        """

        self._email = email

    @property
    def display_name(self) -> str:
        """Gets the display_name of this OdxAny.


        :return: The display_name of this OdxAny.
        :rtype: str
        """
        return self._display_name

    @display_name.setter
    def display_name(self, display_name: str):
        """Sets the display_name of this OdxAny.


        :param display_name: The display_name of this OdxAny.
        :type display_name: str
        """

        self._display_name = display_name

    @property
    def factor_si_to_unit(self) -> float:
        """Gets the factor_si_to_unit of this OdxAny.


        :return: The factor_si_to_unit of this OdxAny.
        :rtype: float
        """
        return self._factor_si_to_unit

    @factor_si_to_unit.setter
    def factor_si_to_unit(self, factor_si_to_unit: float):
        """Sets the factor_si_to_unit of this OdxAny.


        :param factor_si_to_unit: The factor_si_to_unit of this OdxAny.
        :type factor_si_to_unit: float
        """

        self._factor_si_to_unit = factor_si_to_unit

    @property
    def offset_si_to_unit(self) -> float:
        """Gets the offset_si_to_unit of this OdxAny.


        :return: The offset_si_to_unit of this OdxAny.
        :rtype: float
        """
        return self._offset_si_to_unit

    @offset_si_to_unit.setter
    def offset_si_to_unit(self, offset_si_to_unit: float):
        """Sets the offset_si_to_unit of this OdxAny.


        :param offset_si_to_unit: The offset_si_to_unit of this OdxAny.
        :type offset_si_to_unit: float
        """

        self._offset_si_to_unit = offset_si_to_unit

    @property
    def physical_dimension_ref(self) -> OdxLinkRef:
        """Gets the physical_dimension_ref of this OdxAny.


        :return: The physical_dimension_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._physical_dimension_ref

    @physical_dimension_ref.setter
    def physical_dimension_ref(self, physical_dimension_ref: OdxLinkRef):
        """Sets the physical_dimension_ref of this OdxAny.


        :param physical_dimension_ref: The physical_dimension_ref of this OdxAny.
        :type physical_dimension_ref: OdxLinkRef
        """

        self._physical_dimension_ref = physical_dimension_ref

    @property
    def unit_refs(self) -> List[OdxLinkRef]:
        """Gets the unit_refs of this OdxAny.


        :return: The unit_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._unit_refs

    @unit_refs.setter
    def unit_refs(self, unit_refs: List[OdxLinkRef]):
        """Sets the unit_refs of this OdxAny.


        :param unit_refs: The unit_refs of this OdxAny.
        :type unit_refs: List[OdxLinkRef]
        """

        self._unit_refs = unit_refs

    @property
    def units(self) -> List[Unit]:
        """Gets the units of this OdxAny.


        :return: The units of this OdxAny.
        :rtype: List[Unit]
        """
        return self._units

    @units.setter
    def units(self, units: List[Unit]):
        """Sets the units of this OdxAny.


        :param units: The units of this OdxAny.
        :type units: List[Unit]
        """

        self._units = units

    @property
    def physical_dimension(self) -> PhysicalDimension:
        """Gets the physical_dimension of this OdxAny.


        :return: The physical_dimension of this OdxAny.
        :rtype: PhysicalDimension
        """
        return self._physical_dimension

    @physical_dimension.setter
    def physical_dimension(self, physical_dimension: PhysicalDimension):
        """Sets the physical_dimension of this OdxAny.


        :param physical_dimension: The physical_dimension of this OdxAny.
        :type physical_dimension: PhysicalDimension
        """

        self._physical_dimension = physical_dimension

    @property
    def unit_groups(self) -> List[UnitGroup]:
        """Gets the unit_groups of this OdxAny.


        :return: The unit_groups of this OdxAny.
        :rtype: List[UnitGroup]
        """
        return self._unit_groups

    @unit_groups.setter
    def unit_groups(self, unit_groups: List[UnitGroup]):
        """Sets the unit_groups of this OdxAny.


        :param unit_groups: The unit_groups of this OdxAny.
        :type unit_groups: List[UnitGroup]
        """

        self._unit_groups = unit_groups

    @property
    def physical_dimensions(self) -> List[PhysicalDimension]:
        """Gets the physical_dimensions of this OdxAny.


        :return: The physical_dimensions of this OdxAny.
        :rtype: List[PhysicalDimension]
        """
        return self._physical_dimensions

    @physical_dimensions.setter
    def physical_dimensions(self, physical_dimensions: List[PhysicalDimension]):
        """Sets the physical_dimensions of this OdxAny.


        :param physical_dimensions: The physical_dimensions of this OdxAny.
        :type physical_dimensions: List[PhysicalDimension]
        """

        self._physical_dimensions = physical_dimensions

    @property
    def ecu_variant_snrefs(self) -> List[str]:
        """Gets the ecu_variant_snrefs of this OdxAny.


        :return: The ecu_variant_snrefs of this OdxAny.
        :rtype: List[str]
        """
        return self._ecu_variant_snrefs

    @ecu_variant_snrefs.setter
    def ecu_variant_snrefs(self, ecu_variant_snrefs: List[str]):
        """Sets the ecu_variant_snrefs of this OdxAny.


        :param ecu_variant_snrefs: The ecu_variant_snrefs of this OdxAny.
        :type ecu_variant_snrefs: List[str]
        """

        self._ecu_variant_snrefs = ecu_variant_snrefs

    @property
    def base_variant_snref(self) -> str:
        """Gets the base_variant_snref of this OdxAny.


        :return: The base_variant_snref of this OdxAny.
        :rtype: str
        """
        return self._base_variant_snref

    @base_variant_snref.setter
    def base_variant_snref(self, base_variant_snref: str):
        """Sets the base_variant_snref of this OdxAny.


        :param base_variant_snref: The base_variant_snref of this OdxAny.
        :type base_variant_snref: str
        """

        self._base_variant_snref = base_variant_snref

    @property
    def pin_number(self) -> int:
        """Gets the pin_number of this OdxAny.


        :return: The pin_number of this OdxAny.
        :rtype: int
        """
        return self._pin_number

    @pin_number.setter
    def pin_number(self, pin_number: int):
        """Sets the pin_number of this OdxAny.


        :param pin_number: The pin_number of this OdxAny.
        :type pin_number: int
        """

        self._pin_number = pin_number

    @property
    def pin_type(self) -> PinType:
        """Gets the pin_type of this OdxAny.


        :return: The pin_type of this OdxAny.
        :rtype: PinType
        """
        return self._pin_type

    @pin_type.setter
    def pin_type(self, pin_type: PinType):
        """Sets the pin_type of this OdxAny.


        :param pin_type: The pin_type of this OdxAny.
        :type pin_type: PinType
        """

        self._pin_type = pin_type

    @property
    def info_components(self) -> List[InfoComponent]:
        """Gets the info_components of this OdxAny.


        :return: The info_components of this OdxAny.
        :rtype: List[InfoComponent]
        """
        return self._info_components

    @info_components.setter
    def info_components(self, info_components: List[InfoComponent]):
        """Sets the info_components of this OdxAny.


        :param info_components: The info_components of this OdxAny.
        :type info_components: List[InfoComponent]
        """

        self._info_components = info_components

    @property
    def vehicle_informations(self) -> List[VehicleInformation]:
        """Gets the vehicle_informations of this OdxAny.


        :return: The vehicle_informations of this OdxAny.
        :rtype: List[VehicleInformation]
        """
        return self._vehicle_informations

    @vehicle_informations.setter
    def vehicle_informations(self, vehicle_informations: List[VehicleInformation]):
        """Sets the vehicle_informations of this OdxAny.


        :param vehicle_informations: The vehicle_informations of this OdxAny.
        :type vehicle_informations: List[VehicleInformation]
        """

        self._vehicle_informations = vehicle_informations

    @property
    def info_component_refs(self) -> List[OdxLinkRef]:
        """Gets the info_component_refs of this OdxAny.


        :return: The info_component_refs of this OdxAny.
        :rtype: List[OdxLinkRef]
        """
        return self._info_component_refs

    @info_component_refs.setter
    def info_component_refs(self, info_component_refs: List[OdxLinkRef]):
        """Sets the info_component_refs of this OdxAny.


        :param info_component_refs: The info_component_refs of this OdxAny.
        :type info_component_refs: List[OdxLinkRef]
        """

        self._info_component_refs = info_component_refs

    @property
    def vehicle_connectors(self) -> List[VehicleConnector]:
        """Gets the vehicle_connectors of this OdxAny.


        :return: The vehicle_connectors of this OdxAny.
        :rtype: List[VehicleConnector]
        """
        return self._vehicle_connectors

    @vehicle_connectors.setter
    def vehicle_connectors(self, vehicle_connectors: List[VehicleConnector]):
        """Sets the vehicle_connectors of this OdxAny.


        :param vehicle_connectors: The vehicle_connectors of this OdxAny.
        :type vehicle_connectors: List[VehicleConnector]
        """

        self._vehicle_connectors = vehicle_connectors

    @property
    def logical_links(self) -> List[LogicalLink]:
        """Gets the logical_links of this OdxAny.


        :return: The logical_links of this OdxAny.
        :rtype: List[LogicalLink]
        """
        return self._logical_links

    @logical_links.setter
    def logical_links(self, logical_links: List[LogicalLink]):
        """Sets the logical_links of this OdxAny.


        :param logical_links: The logical_links of this OdxAny.
        :type logical_links: List[LogicalLink]
        """

        self._logical_links = logical_links

    @property
    def ecu_groups(self) -> List[EcuGroup]:
        """Gets the ecu_groups of this OdxAny.


        :return: The ecu_groups of this OdxAny.
        :rtype: List[EcuGroup]
        """
        return self._ecu_groups

    @ecu_groups.setter
    def ecu_groups(self, ecu_groups: List[EcuGroup]):
        """Sets the ecu_groups of this OdxAny.


        :param ecu_groups: The ecu_groups of this OdxAny.
        :type ecu_groups: List[EcuGroup]
        """

        self._ecu_groups = ecu_groups

    @property
    def physical_vehicle_links(self) -> List[PhysicalVehicleLink]:
        """Gets the physical_vehicle_links of this OdxAny.


        :return: The physical_vehicle_links of this OdxAny.
        :rtype: List[PhysicalVehicleLink]
        """
        return self._physical_vehicle_links

    @physical_vehicle_links.setter
    def physical_vehicle_links(self, physical_vehicle_links: List[PhysicalVehicleLink]):
        """Sets the physical_vehicle_links of this OdxAny.


        :param physical_vehicle_links: The physical_vehicle_links of this OdxAny.
        :type physical_vehicle_links: List[PhysicalVehicleLink]
        """

        self._physical_vehicle_links = physical_vehicle_links

    @property
    def write_diag_comm_ref(self) -> OdxLinkRef:
        """Gets the write_diag_comm_ref of this OdxAny.


        :return: The write_diag_comm_ref of this OdxAny.
        :rtype: OdxLinkRef
        """
        return self._write_diag_comm_ref

    @write_diag_comm_ref.setter
    def write_diag_comm_ref(self, write_diag_comm_ref: OdxLinkRef):
        """Sets the write_diag_comm_ref of this OdxAny.


        :param write_diag_comm_ref: The write_diag_comm_ref of this OdxAny.
        :type write_diag_comm_ref: OdxLinkRef
        """

        self._write_diag_comm_ref = write_diag_comm_ref

    @property
    def write_diag_comm_snref(self) -> str:
        """Gets the write_diag_comm_snref of this OdxAny.


        :return: The write_diag_comm_snref of this OdxAny.
        :rtype: str
        """
        return self._write_diag_comm_snref

    @write_diag_comm_snref.setter
    def write_diag_comm_snref(self, write_diag_comm_snref: str):
        """Sets the write_diag_comm_snref of this OdxAny.


        :param write_diag_comm_snref: The write_diag_comm_snref of this OdxAny.
        :type write_diag_comm_snref: str
        """

        self._write_diag_comm_snref = write_diag_comm_snref

    @property
    def write_data_snref(self) -> str:
        """Gets the write_data_snref of this OdxAny.


        :return: The write_data_snref of this OdxAny.
        :rtype: str
        """
        return self._write_data_snref

    @write_data_snref.setter
    def write_data_snref(self, write_data_snref: str):
        """Sets the write_data_snref of this OdxAny.


        :param write_data_snref: The write_data_snref of this OdxAny.
        :type write_data_snref: str
        """

        self._write_data_snref = write_data_snref

    @property
    def write_data_snpathref(self) -> str:
        """Gets the write_data_snpathref of this OdxAny.


        :return: The write_data_snpathref of this OdxAny.
        :rtype: str
        """
        return self._write_data_snpathref

    @write_data_snpathref.setter
    def write_data_snpathref(self, write_data_snpathref: str):
        """Sets the write_data_snpathref of this OdxAny.


        :param write_data_snpathref: The write_data_snpathref of this OdxAny.
        :type write_data_snpathref: str
        """

        self._write_data_snpathref = write_data_snpathref

    @property
    def write_diag_comm(self) -> DiagComm:
        """Gets the write_diag_comm of this OdxAny.


        :return: The write_diag_comm of this OdxAny.
        :rtype: DiagComm
        """
        return self._write_diag_comm

    @write_diag_comm.setter
    def write_diag_comm(self, write_diag_comm: DiagComm):
        """Sets the write_diag_comm of this OdxAny.


        :param write_diag_comm: The write_diag_comm of this OdxAny.
        :type write_diag_comm: DiagComm
        """

        self._write_diag_comm = write_diag_comm

    @property
    def write_data(self) -> ValueParameter:
        """Gets the write_data of this OdxAny.


        :return: The write_data of this OdxAny.
        :rtype: ValueParameter
        """
        return self._write_data

    @write_data.setter
    def write_data(self, write_data: ValueParameter):
        """Sets the write_data of this OdxAny.


        :param write_data: The write_data of this OdxAny.
        :type write_data: ValueParameter
        """

        self._write_data = write_data

    @property
    def number(self) -> str:
        """Gets the number of this OdxAny.


        :return: The number of this OdxAny.
        :rtype: str
        """
        return self._number

    @number.setter
    def number(self, number: str):
        """Sets the number of this OdxAny.


        :param number: The number of this OdxAny.
        :type number: str
        """

        self._number = number

    @property
    def publisher(self) -> str:
        """Gets the publisher of this OdxAny.


        :return: The publisher of this OdxAny.
        :rtype: str
        """
        return self._publisher

    @publisher.setter
    def publisher(self, publisher: str):
        """Sets the publisher of this OdxAny.


        :param publisher: The publisher of this OdxAny.
        :type publisher: str
        """

        self._publisher = publisher

    @property
    def url(self) -> str:
        """Gets the url of this OdxAny.


        :return: The url of this OdxAny.
        :rtype: str
        """
        return self._url

    @url.setter
    def url(self, url: str):
        """Sets the url of this OdxAny.


        :param url: The url of this OdxAny.
        :type url: str
        """

        self._url = url

    @property
    def position(self) -> str:
        """Gets the position of this OdxAny.


        :return: The position of this OdxAny.
        :rtype: str
        """
        return self._position

    @position.setter
    def position(self, position: str):
        """Sets the position of this OdxAny.


        :param position: The position of this OdxAny.
        :type position: str
        """

        self._position = position
