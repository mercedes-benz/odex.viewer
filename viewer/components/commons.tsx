// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Button } from '@heroui/button'
import { Chip } from '@heroui/chip'
import { Divider } from '@heroui/divider'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from '@heroui/dropdown'
import { Link } from '@heroui/link'
import { Popover, PopoverContent, PopoverTrigger } from '@heroui/popover'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import { Tab, Tabs } from '@heroui/tabs'
import { PressEvent } from '@react-types/shared'
import clsx from 'clsx'
import parse from 'html-react-parser'
import React from 'react'

import {
  Description,
  DiagCodedType,
  DopBase,
  isBasicStructureDop,
  isDataObjectPropertyDop,
  isDtcDop,
  isEnvironmentDataDescriptionDop,
  isFieldDop,
  isLeadingLengthInfoDiagCodedType,
  isMinMaxLengthDiagCodedType,
  isMultiplexerDop,
  isParamLengthInfoDiagCodedType,
  isStandardLengthDiagCodedType,
  OdxLinkRef,
  Request,
  Response,
  InternalConstr,
  PhysicalType,
  CompuMethod,
  DataType,
  Limit,
  CompuCategory,
  Radix,
  MultiplexerCase,
  MultiplexerDefaultCase,
  MultiplexerSwitchKey,
  DynEndDopRef,
  DetermineNumberOfItems,
  CompuInternalToPhys,
  CompuPhysToInternal,
  AdminData,
  UnitResolved,
  PhysicalDimension,
  ScaleConstr,
  ScaleConstrValidType,
  ProgCode,
  CompuScale,
  CompuDefaultValue,
  CompuConst,
  CompuRationalCoeffs,
  DiagLayerType,
  Addressing,
  DiagClassType,
  Encoding,
  TransmissionMode,
} from '@/api/api-hooks'
import {
  CollapseIcon,
  DetailsIcon,
  ExpandIcon,
  PlusIcon,
  VerticalDotsIcon,
} from '@/components/icons'
import { ParametersComponent } from '@/components/parameters'
import { subtitleWithSize } from '@/components/primitives'
import { SpecialDataGroupsComponent } from '@/components/specialdatagroups'
import { DiagnosticCommTargetObjectIds } from '@/types/index'
import { cleanupHtmlContent, constrainTextByLength } from '@/utils/utils'

export function PreviousPageButton({
  isDisabled,
  onPress,
}: {
  isDisabled: boolean
  onPress: (e: PressEvent) => void
}) {
  return (
    <Button isDisabled={isDisabled} size="md" variant="flat" onPress={onPress}>
      Previous
    </Button>
  )
}

export function NextPageButton({
  isDisabled,
  onPress,
}: {
  isDisabled: boolean
  onPress: (e: PressEvent) => void
}) {
  return (
    <Button isDisabled={isDisabled} size="md" variant="flat" onPress={onPress}>
      Next
    </Button>
  )
}

export function AddNewButton() {
  return (
    <Button color="primary" endContent={<PlusIcon />}>
      Add New
    </Button>
  )
}

export function LinkButton({
  href,
  label,
  dataTestId,
}: {
  href: string
  label: string
  dataTestId?: string
}) {
  return (
    <Button
      className="align-end"
      data-testid={dataTestId}
      radius="sm"
      size="sm"
    >
      <Link className="dark:text-blue-500" href={href}>
        {label}
      </Link>
    </Button>
  )
}

export function ActionDropdown({
  view_href,
  deleteFunc,
}: {
  view_href: string
  deleteFunc?: (e: PressEvent) => void
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button isIconOnly size="sm" variant="light">
          <VerticalDotsIcon />
        </Button>
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem key="view" href={view_href}>
          View
        </DropdownItem>
        <DropdownItem key="edit">Edit</DropdownItem>
        <DropdownItem key="delete" onPress={deleteFunc}>
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export function VariantTypeChip({
  variantType,
}: {
  variantType: DiagLayerType | undefined
}) {
  return variantType ? (
    <Chip
      className={clsx(
        {
          'dark:text-blue-400 text-blue-600': variantType === 'BASE-VARIANT',
          'dark:text-purple-400 text-purple-600':
            variantType === 'ECU-SHARED-DATA',
          'dark:text-green-400 text-green-600': variantType === 'ECU-VARIANT',
          'dark:text-slate-400 text-slate-600':
            variantType === 'FUNCTIONAL-GROUP',
          'dark:text-stone-400 text-stone-600': variantType === 'PROTOCOL',
        },
        'border-blue-500'
      )}
      radius="sm"
      variant="bordered"
    >
      {variantType}
    </Chip>
  ) : (
    <></>
  )
}

export function DiagCommTypeChip({
  commType,
}: {
  commType: string | undefined
}) {
  return commType ? (
    <Chip
      className={clsx(
        {
          'dark:text-orange-400 text-orange-800': commType === 'SingleEcuJob',
        },
        'border-yellow-600'
      )}
      radius="sm"
      variant="bordered"
    >
      {commType}
    </Chip>
  ) : (
    <></>
  )
}

export function DiagCommSemanticChip({
  semantic,
}: {
  semantic: string | undefined
}) {
  return semantic ? (
    <Chip className="border-green-600" radius="sm" variant="bordered">
      {semantic}
    </Chip>
  ) : (
    <></>
  )
}

export function ParameterSemanticChip({
  semantic,
}: {
  semantic: string | undefined
}) {
  return semantic ? (
    <Chip className="border-green-600" radius="sm" variant="bordered">
      {semantic}
    </Chip>
  ) : (
    <></>
  )
}

export function ParameterTypeChip({
  paramType,
}: {
  paramType: string | undefined
}) {
  return paramType ? (
    <Chip className="border-red-600" radius="sm" variant="bordered">
      {paramType}
    </Chip>
  ) : (
    <></>
  )
}

export function FunctionalClassChip({
  functionalClass,
}: {
  functionalClass: string | undefined
}) {
  return functionalClass ? (
    <Chip className="border-rose-600" radius="sm" variant="bordered">
      {functionalClass}
    </Chip>
  ) : (
    <></>
  )
}

export function AddressingChip({
  addressing,
}: {
  addressing: Addressing | undefined
}) {
  return addressing ? (
    <Chip
      className={clsx(
        {
          'dark:text-teal-400 text-teal-600': addressing === 'PHYSICAL',
          'dark:text-blue-400 text-blue-600': addressing === 'FUNCTIONAL',
          'dark:text-purple-400 text-purple-600':
            addressing === 'FUNCTIONAL-OR-PHYSICAL',
        },
        'border-teal-600'
      )}
      radius="sm"
      variant="bordered"
    >
      {addressing}
    </Chip>
  ) : (
    <></>
  )
}

export function TransmissionModeChip({
  mode,
}: {
  mode: TransmissionMode | undefined
}) {
  return mode ? (
    <Chip
      className={clsx(
        {
          'dark:text-blue-400 text-blue-600': mode === 'SEND-AND-RECEIVE',
          'dark:text-teal-400 text-teal-600': mode === 'SEND-OR-RECEIVE',
          'dark:text-green-400 text-green-600': mode === 'RECEIVE-ONLY',
          'dark:text-red-400 text-red-600': mode === 'SEND-ONLY',
        },
        'border-blue-600'
      )}
      radius="sm"
      variant="bordered"
    >
      {mode}
    </Chip>
  ) : (
    <></>
  )
}

export function DiagnosticClassChip({
  diagClass,
}: {
  diagClass: DiagClassType | undefined
}) {
  return diagClass ? (
    <Chip className="border-blue-500" radius="sm" variant="bordered">
      {diagClass}
    </Chip>
  ) : (
    <></>
  )
}

export function DtcLevelChip({ level }: { level: number | undefined }) {
  return level ? (
    <Chip
      className={clsx(
        {
          'dark:text-red-400 text-red-600': level == 2,
          'dark:text-orange-400 text-orange-600': level == 7,
          'dark:text-blue-400 text-blue-600': level !== 7 && level !== 2,
        },
        'border-rose-800'
      )}
      radius="sm"
      variant="bordered"
    >
      {level}
    </Chip>
  ) : (
    <></>
  )
}

export function DopTypeChip({ dop }: { dop: DopBase | undefined }) {
  return dop ? (
    <Chip
      className={clsx(
        {
          'dark:text-red-400 text-red-600': isDtcDop(dop),
          'dark:text-orange-400 text-orange-600': isMultiplexerDop(dop),
          'dark:text-green-400 text-green-600': isDataObjectPropertyDop(dop),
          'dark:text-blue-400 text-blue-600': isBasicStructureDop(dop),
          'dark:text-teal-400 text-teal-600': isFieldDop(dop),
          'dark:text-purple-400 text-purple-600':
            isEnvironmentDataDescriptionDop(dop),
        },
        'border-blue-500'
      )}
      radius="sm"
      variant="bordered"
    >
      {dop.class_name}
    </Chip>
  ) : (
    <></>
  )
}

export function TypeEncodingChip({
  encoding,
}: {
  encoding: Encoding | undefined
}) {
  return encoding ? (
    <Chip
      className={clsx(
        {
          'dark:text-red-400 text-red-600': encoding == 'NONE',
          'dark:text-blue-400 text-blue-600': encoding !== 'NONE',
        },
        'border-rose-800'
      )}
      radius="sm"
      variant="bordered"
    >
      {encoding}
    </Chip>
  ) : (
    <></>
  )
}

export function ScaleConstraintValidityChip({
  validity,
}: {
  validity: ScaleConstrValidType
}) {
  return (
    <Chip
      className={clsx(
        {
          'dark:text-red-400 text-red-600': validity === 'NOT-VALID',
          'dark:text-orange-400 text-orange-600': validity === 'NOT-DEFINED',
          'dark:text-green-400 text-green-600': validity === 'VALID',
          'dark:text-purple-400 text-purple-600': validity === 'NOT-AVAILABLE',
        },
        'border-teal-500'
      )}
      radius="sm"
      variant="bordered"
    >
      {validity}
    </Chip>
  )
}

export function RequestResponseMetadataComponent({
  reqResponse,
  pageId,
}: {
  reqResponse: Request | Response
  pageId: string
}) {
  return (
    <div className="flex w-full flex-col">
      <div className="text-start">
        <div className={subtitleWithSize({ size: 'md' })}>Metadata</div>
      </div>
      <Tabs aria-label="Metadata tabs" variant="solid">
        <Tab key="metadata_details" title="Details">
          <Table
            hideHeader
            isStriped
            aria-label="Request/Response metadata table"
          >
            <TableHeader>
              <TableColumn width={150}>KEY</TableColumn>
              <TableColumn>VALUE</TableColumn>
            </TableHeader>
            <TableBody>
              <TableRow key="short_name">
                <TableCell className="font-bold" width={150}>
                  Short Name
                </TableCell>
                <TableCell>
                  <p>{reqResponse.short_name}</p>
                </TableCell>
              </TableRow>
              <TableRow key="long_name">
                <TableCell className="font-bold">Long Name</TableCell>
                <TableCell>
                  <p>{reqResponse.long_name}</p>
                </TableCell>
              </TableRow>
              {reqResponse.description ? (
                <TableRow key="description">
                  <TableCell className="font-bold">Description</TableCell>
                  <TableCell>
                    <DescriptionComponent
                      description={reqResponse.description}
                      enableUnfolding={true}
                      maxDisplayLengthLimit={200}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <></>
              )}
              {reqResponse.admin_data ? (
                <AdminDataComponent adminData={reqResponse.admin_data} />
              ) : (
                <></>
              )}
            </TableBody>
          </Table>
        </Tab>
        {reqResponse.sdgs ? (
          <Tab key="metadata_sdgs" title="Special Data Groups (SDGs)">
            <SpecialDataGroupsComponent
              pageId={pageId}
              sdgs={reqResponse.sdgs}
            />
          </Tab>
        ) : (
          <></>
        )}
      </Tabs>
    </div>
  )
}

export function CommonRequestResponseComponent({
  reqResponse,
  targetObjectIds,
  pageId,
}: {
  reqResponse: Request | Response
  targetObjectIds: DiagnosticCommTargetObjectIds
  pageId: string
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="pb-2">
        <RequestResponseMetadataComponent
          pageId={pageId}
          reqResponse={reqResponse}
        />
      </div>
      <div className="pb-2">
        <div className="text-start">
          <div className={subtitleWithSize({ size: 'md' })}>Parameters</div>
        </div>
        {reqResponse.parameters ? (
          <ParametersComponent
            pageId={pageId}
            parentObject={reqResponse}
            targetObjectIds={targetObjectIds}
          />
        ) : (
          <div className="pt-4 place-self-start">
            <span>No PARAMETERs specified</span>
          </div>
        )}
      </div>
    </div>
  )
}

export function DescriptionComponent({
  description,
  minDisplayLength,
  maxDisplayLengthLimit,
  enableUnfolding,
  initialState,
}: {
  description: Description | undefined
  minDisplayLength?: number
  maxDisplayLengthLimit?: number
  enableUnfolding?: boolean
  initialState?: 'collapsed' | 'uncollapsed'
}) {
  const fullContent =
    description && description.text ? cleanupHtmlContent(description.text) : ''
  const constrainedContent =
    maxDisplayLengthLimit && maxDisplayLengthLimit > 0
      ? constrainTextByLength(
          fullContent,
          minDisplayLength,
          maxDisplayLengthLimit
        )
      : ''

  const [isCollapsedState, setIsCollapsedState] = React.useState<boolean>(
    initialState ? initialState === 'collapsed' : true
  )
  const descriptionText = React.useMemo(() => {
    if (isCollapsedState) {
      return constrainedContent
    } else {
      return fullContent
    }
  }, [isCollapsedState])

  return description ? (
    enableUnfolding && fullContent !== constrainedContent ? (
      <div>
        {parse(descriptionText)}
        {isCollapsedState ? (
          <ExpandIcon onClick={() => setIsCollapsedState(!isCollapsedState)} />
        ) : (
          <CollapseIcon
            onClick={() => setIsCollapsedState(!isCollapsedState)}
          />
        )}
      </div>
    ) : (
      <div>{parse(descriptionText)}</div>
    )
  ) : (
    <></>
  )
}

export function OdxLinkComponent({
  odxLink,
}: {
  odxLink: OdxLinkRef | undefined
}) {
  return odxLink ? (
    <div className="grid grid-cols-[120px_minmax(100px,_1fr)] gap-1">
      <p className="font-medium">Reference ID: </p>
      <p>{odxLink.ref_id}</p>
      <p className="font-medium">Target object SHORT-NAME: </p>
      <p className="content-end">{odxLink.resolved_object_short_name}</p>
      <p className="font-medium">Target perma ID: </p>
      <p>{odxLink.resolved_object_perma_id}</p>
      <p className="font-medium">Target ephemeral ID: </p>
      <p>{odxLink.resolved_object_ephemeral_id}</p>
      <p className="font-bold pt-2 ">Reference Details</p>
      {odxLink.ref_docs?.map((entry, index) => (
        <div
          key={entry.ephemeral_id}
          className="col-span-2 grid grid-cols-[120px_minmax(100px,_1fr)]"
        >
          <p className="font-medium">Document Name: </p>
          {entry.doc_name ? (
            <p>{entry.doc_name}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
          <p className="font-medium">Document Type: </p>
          {entry.doc_type ? (
            <p>{entry.doc_type}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
          <p className="font-medium">Ephemeral ID: </p>
          <p>{entry.ephemeral_id}</p>
          {entry.perma_id ? (
            <div>
              <p className="font-medium">Perma ID: </p>
              <p>{entry.perma_id}</p>
            </div>
          ) : (
            <></>
          )}
          {odxLink.ref_docs && index < odxLink.ref_docs.length - 1 ? (
            <Divider className="mt-1 mb-1 col-span-2" />
          ) : (
            <></>
          )}
        </div>
      ))}
    </div>
  ) : (
    <></>
  )
}

export function OdxLinkPopoverComponent({
  odxLink,
  href,
  label,
}: {
  odxLink: OdxLinkRef | undefined
  href?: string
  label?: string
}) {
  return odxLink ? (
    <Popover
      classNames={{
        base: ['before:bg-blue-700'],
        content: ['border border-blue-700'],
      }}
      placement="right"
      showArrow={true}
    >
      <PopoverTrigger>
        <Button
          className="dark:bg-gray-700 bg-gray-100 border border-2 border-blue-700 text-md"
          endContent={<DetailsIcon />}
          size="sm"
          variant="shadow"
        >
          <Link className="dark:text-blue-500" href={href}>
            {odxLink.resolved_object_short_name}
          </Link>
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {(titleProps) => (
          <div className="px-1 py-2">
            <div className="grid grid-cols-2 gap-1">
              <h3
                className="text-lg font-bold justify-self-start"
                {...titleProps}
              >
                Details
              </h3>
              <div className="justify-self-end pb-2">
                {href ? (
                  <LinkButton
                    href={href}
                    label={label ? label : 'Open definition'}
                  />
                ) : (
                  <></>
                )}
              </div>
            </div>
            <OdxLinkComponent odxLink={odxLink} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  ) : (
    <></>
  )
}

export function DiagCodedTypeComponent({
  diagCodedType,
}: {
  diagCodedType: DiagCodedType | undefined
}) {
  return diagCodedType ? (
    <div className="grid grid-cols-[200px_minmax(100px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Base type: </p>
      {diagCodedType.base_data_type ? (
        <DataTypeChip dataType={diagCodedType.base_data_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Base type encoding: </p>
      {diagCodedType.base_type_encoding ? (
        <TypeEncodingChip encoding={diagCodedType.base_type_encoding} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Is high-low byte order: </p>
      {diagCodedType.is_highlow_byte_order !== undefined ? (
        <p>{diagCodedType.is_highlow_byte_order.toString()}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Type: </p>
      <p>{diagCodedType.class_name}</p>
      <Divider className="mt-1 mb-1 col-span-2" />
      <p className="font-bold pt-2 ">Type-specific details</p>

      {isStandardLengthDiagCodedType(diagCodedType) ? (
        <div className="col-span-2 grid grid-cols-[120px_minmax(100px,_1fr)] justify-items-start">
          <p className="font-medium">Bit length: </p>
          {diagCodedType.bit_length ? (
            <p>{diagCodedType.bit_length}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
          <p className="font-medium">Bit mask: </p>
          {diagCodedType.bit_mask ? (
            <p>{diagCodedType.bit_mask}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
          <p className="font-medium">Is condensed: </p>
          {diagCodedType.is_condensed !== undefined ? (
            <p>{diagCodedType.is_condensed.toString()}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
        </div>
      ) : isLeadingLengthInfoDiagCodedType(diagCodedType) ? (
        <div className="col-span-2 grid grid-cols-[120px_minmax(100px,_1fr)]">
          <p className="font-medium">Bit length: </p>
          {diagCodedType.bit_length ? (
            <p>{diagCodedType.bit_length}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
        </div>
      ) : isParamLengthInfoDiagCodedType(diagCodedType) ? (
        <div className="col-span-2 grid grid-cols-[120px_minmax(100px,_1fr)]">
          <p className="font-medium">Length key reference: </p>
          {diagCodedType.length_key_ref ? (
            <OdxLinkComponent odxLink={diagCodedType.length_key_ref} />
          ) : (
            <p className="italic">not specified</p>
          )}
        </div>
      ) : isMinMaxLengthDiagCodedType(diagCodedType) ? (
        <div className="col-span-2 grid grid-cols-[120px_minmax(100px,_1fr)]">
          <p className="font-medium">Min length Name: </p>
          {diagCodedType.min_length ? (
            <p>{diagCodedType.min_length}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
          <p className="font-medium">Max length: </p>
          {diagCodedType.max_length ? (
            <p>{diagCodedType.max_length}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
          <p className="font-medium">Termination: </p>
          {diagCodedType.termination ? (
            <p>{diagCodedType.termination}</p>
          ) : (
            <p className="italic">not specified</p>
          )}
        </div>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  )
}

export function DiagCodedTypePopoverComponent({
  diagCodedType,
}: {
  diagCodedType: DiagCodedType
}) {
  return (
    <Popover
      classNames={{
        base: ['before:bg-blue-700'],
        content: ['border border-blue-700'],
      }}
      placement="right"
      showArrow={true}
    >
      <PopoverTrigger>
        <Button
          className="dark:bg-gray-700 bg-gray-100 border border-2 border-blue-700 text-md"
          endContent={<DetailsIcon />}
          size="sm"
          variant="shadow"
        >
          {diagCodedType.base_data_type}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {(titleProps) => (
          <div className="px-1 py-2">
            <h3
              className="text-lg font-bold justify-self-start pb-2"
              {...titleProps}
            >
              Details
            </h3>
            <DiagCodedTypeComponent diagCodedType={diagCodedType} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function RadixChip({ radix }: { radix: Radix | undefined }) {
  return radix ? (
    <Chip
      className={clsx(
        {
          'dark:text-blue-400 text-blue-600': radix === 'HEX',
          'dark:text-purple-400 text-purple-600': radix === 'DEC',
          'dark:text-green-400 text-green-600': radix === 'BIN',
          'dark:text-slate-400 text-slate-600': radix === 'OCT',
        },
        'border-blue-500'
      )}
      radius="sm"
      variant="bordered"
    >
      {radix}
    </Chip>
  ) : (
    <></>
  )
}

export function PhysicalTypeComponent({
  physicalType,
  layout,
}: {
  physicalType: PhysicalType | undefined
  layout: 'Table' | 'Page'
}) {
  return physicalType ? (
    <div
      className={clsx(
        {
          'grid-cols-[200px_minmax(200px,_1fr)] justify-items-start':
            layout === 'Page',
          'grid-cols-[120px_minmax(100px,_1fr)]': layout === 'Table',
        },
        'grid gap-1'
      )}
    >
      <p className="font-medium">Base type: </p>
      {physicalType.base_data_type ? (
        <DataTypeChip dataType={physicalType.base_data_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Display RADIX: </p>
      {physicalType.display_radix ? (
        <RadixChip radix={physicalType.display_radix} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Precision: </p>
      {physicalType.precision !== undefined ? (
        <p>{physicalType.precision.toString()}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  ) : (
    <></>
  )
}

export function CompuMethodCategoryChip({
  category,
}: {
  category: CompuCategory | undefined
}) {
  return category ? (
    <Chip
      className={clsx(
        {
          'dark:text-teal-400 text-teal-600': category === 'IDENTICAL',
          'dark:text-blue-400 text-blue-600': category === 'COMPUCODE',
          'dark:text-green-400 text-green-600': category === 'LINEAR',
          'dark:text-purple-400 text-purple-600': category === 'TEXTTABLE',
          'dark:text-slate-400 text-slate-600': category === 'RAT-FUNC',
          'dark:text-emerald-400 text-emerald-600': category === 'SCALE-LINEAR',
          'dark:text-neutral-400 text-neutral-600':
            category === 'SCALE-RAT-FUNC',
          'dark:text-amber-400 text-amber-600': category === 'TAB-INTP',
        },
        'border-teal-600'
      )}
      radius="sm"
      variant="bordered"
    >
      {category}
    </Chip>
  ) : (
    <></>
  )
}

export function DataTypeChip({ dataType }: { dataType: DataType | undefined }) {
  return dataType ? (
    <Chip
      className={clsx(
        {
          'dark:text-blue-400 text-blue-600':
            dataType === 'A_UNICODE2STRING' ||
            dataType === 'A_ASCIISTRING' ||
            dataType === 'A_UTF8STRING',
          'dark:text-purple-400 text-purple-600': dataType === 'A_BYTEFIELD',
          'dark:text-green-400 text-green-600':
            dataType === 'A_FLOAT32' || dataType === 'A_FLOAT64',
          'dark:text-teal-400 text-teal-600':
            dataType === 'A_UINT32' || dataType === 'A_INT32',
        },
        'border-blue-500'
      )}
      radius="sm"
      variant="bordered"
    >
      {dataType}
    </Chip>
  ) : (
    <></>
  )
}

export function CompuMethodCompactComponent({
  compuMethod,
}: {
  compuMethod: CompuMethod | undefined
}) {
  return compuMethod ? (
    <div className="grid grid-cols-[160px_minmax(100px,_1fr)] gap-1">
      <p className="font-medium">Category: </p>
      {compuMethod.category ? (
        <CompuMethodCategoryChip category={compuMethod.category} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Physical Type: </p>
      {compuMethod.physical_type ? (
        <DataTypeChip dataType={compuMethod.physical_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Internal Type: </p>
      {compuMethod.internal_type !== undefined ? (
        <DataTypeChip dataType={compuMethod.internal_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  ) : (
    <></>
  )
}

export function CompuMethodComponent({
  compuMethod,
}: {
  compuMethod: CompuMethod | undefined
}) {
  return compuMethod ? (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Category: </p>
      {compuMethod.category ? (
        <CompuMethodCategoryChip category={compuMethod.category} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Physical Type: </p>
      {compuMethod.physical_type ? (
        <DataTypeChip dataType={compuMethod.physical_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Internal Type: </p>
      {compuMethod.internal_type !== undefined ? (
        <DataTypeChip dataType={compuMethod.internal_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Internal-to-Physical: </p>
      {compuMethod.compu_internal_to_phys !== undefined ? (
        <div className="dark:bg-neutral-700 bg-neutral-200 rounded-md p-2 mb-2">
          <PhysicalInternalMappingComponent
            mapping={compuMethod.compu_internal_to_phys}
          />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Physical-to-internal: </p>
      {compuMethod.compu_phys_to_internal !== undefined ? (
        <div className="dark:bg-neutral-700 bg-neutral-200 rounded-md p-2 mb-2">
          <PhysicalInternalMappingComponent
            mapping={compuMethod.compu_phys_to_internal}
          />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  ) : (
    <></>
  )
}

export function LimitCompactComponent({ limit }: { limit: Limit }) {
  return (
    <div className="grid grid-cols-[160px_minmax(100px,_1fr)] gap-1">
      <p className="font-medium">Value: </p>
      {limit.value !== undefined ? (
        <p>{limit.value}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Interval Type: </p>
      {limit.interval_type !== undefined ? (
        <p>{limit.interval_type}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Value type: </p>
      {limit.value_type !== undefined ? (
        <DataTypeChip dataType={limit.value_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function LimitComponent({ limit }: { limit: Limit }) {
  return (
    <div className="grid grid-cols-[200px_minmax(100px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Value: </p>
      {limit.value !== undefined ? (
        <p>{limit.value}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Interval Type: </p>
      {limit.interval_type !== undefined ? (
        <p>{limit.interval_type}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Value type: </p>
      {limit.value_type !== undefined ? (
        <DataTypeChip dataType={limit.value_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function InternalConstraintCompactComponent({
  constraint,
}: {
  constraint: InternalConstr | undefined
}) {
  return constraint ? (
    <div className="grid grid-cols-[160px_minmax(100px,_1fr)] gap-1">
      <p className="font-medium">Value type: </p>
      {constraint.value_type ? (
        <DataTypeChip dataType={constraint.value_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Lower Limit: </p>
      {constraint.lower_limit !== undefined ? (
        <LimitCompactComponent limit={constraint.lower_limit} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Upper Limit: </p>
      {constraint.upper_limit !== undefined ? (
        <LimitCompactComponent limit={constraint.upper_limit} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">#Scale Constraints: </p>
      {constraint.scale_constrs !== undefined ? (
        <p>{constraint.scale_constrs.length}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  ) : (
    <></>
  )
}

export function InternalConstraintComponent({
  constraint,
}: {
  constraint: InternalConstr | undefined
}) {
  return constraint ? (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Value type: </p>
      {constraint.value_type ? (
        <DataTypeChip dataType={constraint.value_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Lower Limit: </p>
      {constraint.lower_limit !== undefined ? (
        <LimitCompactComponent limit={constraint.lower_limit} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Upper Limit: </p>
      {constraint.upper_limit !== undefined ? (
        <LimitCompactComponent limit={constraint.upper_limit} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Scale Constraints: </p>
      {constraint.scale_constrs !== undefined ? (
        <div>
          {constraint.scale_constrs.map((scale, index) => (
            <div
              key={scale.ephemeral_id}
              className={clsx(
                {
                  'dark:bg-neutral-700 bg-neutral-200': index % 2 === 0,
                  'dark:bg-neutral-600 bg-neutral-300': index % 2 !== 0,
                },
                'rounded-md p-2 mb-2'
              )}
            >
              <ScaleContraintComponent scale_constraint={scale} />
            </div>
          ))}
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  ) : (
    <></>
  )
}

export function PhysicalTypePopoverComponent({
  physicalType,
}: {
  physicalType: PhysicalType
}) {
  return (
    <Popover
      classNames={{
        base: ['before:bg-lime-600'],
        content: ['border border-lime-600'],
      }}
      placement="right"
      showArrow={true}
    >
      <PopoverTrigger>
        <Button
          className="dark:bg-gray-700 bg-gray-100 border border-2 border-lime-600 text-md"
          endContent={<DetailsIcon />}
          size="sm"
          variant="shadow"
        >
          {physicalType.base_data_type}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {(titleProps) => (
          <div className="px-1 py-2">
            <h3
              className="text-lg font-bold justify-self-start pb-2"
              {...titleProps}
            >
              Details
            </h3>
            <PhysicalTypeComponent
              layout={'Table'}
              physicalType={physicalType}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function CompuMethodPopoverComponent({
  compuMethod,
  dop_href,
}: {
  compuMethod: CompuMethod
  dop_href: string
}) {
  return (
    <Popover
      classNames={{
        base: ['before:bg-teal-700'],
        content: ['border border-teal-700'],
      }}
      placement="right"
      showArrow={true}
    >
      <PopoverTrigger>
        <Button
          className="dark:bg-gray-700 bg-gray-100 border border-2 border-teal-700 text-md"
          endContent={<DetailsIcon />}
          size="sm"
          variant="shadow"
        >
          {compuMethod.category}
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {(titleProps) => (
          <div className="px-1 py-2">
            <h3
              className="text-lg font-bold justify-self-start pb-2"
              {...titleProps}
            >
              Quick overview
            </h3>
            <CompuMethodCompactComponent compuMethod={compuMethod} />
            <div className="mt-5 justify-self-end">
              <LinkButton href={dop_href} label="Show details on DOP page" />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function InternalConstraintPopoverComponent({
  constraint,
  dop_href,
}: {
  constraint: InternalConstr
  dop_href: string
}) {
  return (
    <Popover
      classNames={{
        base: ['before:bg-red-700'],
        content: ['border border-red-700'],
      }}
      placement="right"
      showArrow={true}
    >
      <PopoverTrigger>
        <Button
          className="dark:bg-gray-700 bg-gray-100 border border-2 border-red-700 text-md"
          endContent={<DetailsIcon />}
          size="sm"
          variant="shadow"
        >
          Constraint
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        {(titleProps) => (
          <div className="px-1 py-2">
            <h3
              className="text-lg font-bold justify-self-start pb-2"
              {...titleProps}
            >
              Quick overview
            </h3>
            <InternalConstraintCompactComponent constraint={constraint} />
            <div className="mt-5 justify-self-end">
              <LinkButton href={dop_href} label="Show details on DOP page" />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function SwitchKeyCompactComponent({
  switch_key,
  variantId,
  containerId,
}: {
  switch_key: MultiplexerSwitchKey
  variantId: string | undefined
  containerId: string | undefined
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(100px,_1fr)] gap-1">
      <p className="font-medium">Byte position: </p>
      {switch_key.byte_position ? (
        <p>{switch_key.byte_position}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Bit position: </p>
      {switch_key.bit_position ? (
        <p>{switch_key.bit_position}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">DOP Reference: </p>
      {switch_key.dop_ref ? (
        <LinkButton
          href={`/dops?objectId=${switch_key.dop_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
          label={
            switch_key.dop_ref.resolved_object_short_name
              ? switch_key.dop_ref.resolved_object_short_name
              : 'Open DOP'
          }
        />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function SwitchKeyComponent({
  switch_key,
  variantId,
  containerId,
}: {
  switch_key: MultiplexerSwitchKey
  variantId: string | undefined
  containerId: string | undefined
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Byte position: </p>
      {switch_key.byte_position ? (
        <p>{switch_key.byte_position}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Bit position: </p>
      {switch_key.bit_position ? (
        <p>{switch_key.bit_position}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">DOP Reference: </p>
      {switch_key.dop_ref ? (
        <LinkButton
          href={`/dops?objectId=${switch_key.dop_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
          label={
            switch_key.dop_ref.resolved_object_short_name
              ? switch_key.dop_ref.resolved_object_short_name
              : 'Open DOP'
          }
        />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function CaseCompactComponent({
  multiplexer_case,
  variantId,
  containerId,
}: {
  multiplexer_case: MultiplexerCase | MultiplexerDefaultCase
  variantId: string | undefined
  containerId: string | undefined
}) {
  return (
    <div className="grid grid-cols-[160px_minmax(100px,_1fr)] gap-1">
      <p className="font-medium">Short Name: </p>
      {multiplexer_case.short_name ? (
        <p>{multiplexer_case.short_name}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Long Name: </p>
      {multiplexer_case.long_name ? (
        <p>{multiplexer_case.long_name}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">DOP Reference: </p>
      {multiplexer_case.structure_ref ? (
        <LinkButton
          href={`/dops?objectId=${multiplexer_case.structure_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
          label={
            multiplexer_case.structure_ref.resolved_object_short_name
              ? multiplexer_case.structure_ref.resolved_object_short_name
              : 'Open DOP'
          }
        />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function CaseComponent({
  multiplexer_case,
  variantId,
  containerId,
}: {
  multiplexer_case: MultiplexerCase | MultiplexerDefaultCase
  variantId: string | undefined
  containerId: string | undefined
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Short Name: </p>
      {multiplexer_case.short_name ? (
        <p>{multiplexer_case.short_name}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Long Name: </p>
      {multiplexer_case.long_name ? (
        <p>{multiplexer_case.long_name}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Description: </p>
      {multiplexer_case.description ? (
        <DescriptionComponent description={multiplexer_case.description} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">DOP Reference: </p>
      {multiplexer_case.structure_ref ? (
        <LinkButton
          href={`/dops?objectId=${multiplexer_case.structure_ref.resolved_object_perma_id}&variantId=${variantId}&containerId=${containerId}`}
          label={
            multiplexer_case.structure_ref.resolved_object_short_name
              ? multiplexer_case.structure_ref.resolved_object_short_name
              : 'Open DOP'
          }
        />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function DynamicEndDopCompactComponent({
  dyn_end_dop_ref,
}: {
  dyn_end_dop_ref: DynEndDopRef
}) {
  {
    /* TODO: Implement */
  }

  return <div />
}

export function DynamicEndDopComponent({
  dyn_end_dop_ref,
}: {
  dyn_end_dop_ref: DynEndDopRef
}) {
  {
    /* TODO: Implement */
  }

  return <div />
}

export function DetermineNumberOfItemsCompactComponent({
  determine_number_of_items,
}: {
  determine_number_of_items: DetermineNumberOfItems
}) {
  {
    /* TODO: Implement */
  }

  return <div />
}

export function DetermineNumberOfItemsComponent({
  determine_number_of_items,
}: {
  determine_number_of_items: DetermineNumberOfItems
}) {
  {
    /* TODO: Implement */
  }

  return <div />
}

export function PhysicalDimensionComponent({
  dimension,
}: {
  dimension: PhysicalDimension
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Short Name: </p>
      {dimension.short_name ? (
        <p>{dimension.short_name}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Long Name: </p>
      {dimension.long_name ? (
        <p>{dimension.long_name}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Description: </p>
      {dimension.description ? (
        <DescriptionComponent
          description={dimension.description}
          enableUnfolding={true}
          maxDisplayLengthLimit={200}
        />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Length Exponent: </p>
      {dimension.length_exp ? (
        <p>{dimension.length_exp}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Mass Exponent: </p>
      {dimension.mass_exp ? (
        <p>{dimension.mass_exp}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Time Exponent: </p>
      {dimension.time_exp ? (
        <p>{dimension.time_exp}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Current Exponent: </p>
      {dimension.current_exp ? (
        <p>{dimension.current_exp}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Temperature Exponent: </p>
      {dimension.temperature_exp ? (
        <p>{dimension.temperature_exp}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Molar Amount Exponent: </p>
      {dimension.molar_amount_exp ? (
        <p>{dimension.molar_amount_exp}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Luminous Intensity Exponent: </p>
      {dimension.luminous_intensity_exp ? (
        <p>{dimension.luminous_intensity_exp}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function UnitComponent({ unit }: { unit: UnitResolved | OdxLinkRef }) {
  if (unit.class_name === 'OdxLinkRef') {
    const unitRef = unit as OdxLinkRef

    return <p>{unitRef.resolved_object_short_name}</p>
  } else {
    const unitResolved = unit as UnitResolved

    return (
      <div className="grid grid-cols-[160px_minmax(100px,_1fr)] gap-1">
        <p className="font-medium">Display Name: </p>
        {unitResolved.display_name ? (
          <p>{unitResolved.display_name}</p>
        ) : (
          <p className="italic">not specified</p>
        )}
        <p className="font-medium">Short Name: </p>
        {unitResolved.short_name ? (
          <p>{unitResolved.short_name}</p>
        ) : (
          <p className="italic">not specified</p>
        )}
        <p className="font-medium">Long Name: </p>
        {unitResolved.long_name ? (
          <p>{unitResolved.long_name}</p>
        ) : (
          <p className="italic">not specified</p>
        )}
        <p className="font-medium">Description: </p>
        {unitResolved.description ? (
          <DescriptionComponent
            description={unitResolved.description}
            enableUnfolding={true}
            maxDisplayLengthLimit={200}
          />
        ) : (
          <p className="italic">not specified</p>
        )}
        <p className="font-medium">Factor SI-to-Unit: </p>
        {unitResolved.factor_si_to_unit ? (
          <p>{unitResolved.factor_si_to_unit}</p>
        ) : (
          <p className="italic">not specified</p>
        )}
        <p className="font-medium">Offset SI-to-Unit: </p>
        {unitResolved.offset_si_to_unit ? (
          <p>{unitResolved.offset_si_to_unit}</p>
        ) : (
          <p className="italic">not specified</p>
        )}
        <p className="font-medium">Physical Dimension: </p>
        {unitResolved.physical_dimension ? (
          <div className="dark:bg-neutral-700 bg-neutral-200 rounded-md p-2 mb-2">
            <PhysicalDimensionComponent
              dimension={unitResolved.physical_dimension}
            />
          </div>
        ) : (
          <p className="italic">not specified</p>
        )}
      </div>
    )
  }
}

export function PhysicalInternalMappingComponent({
  mapping,
}: {
  mapping: CompuPhysToInternal | CompuInternalToPhys
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Prog Code: </p>
      {mapping.prog_code ? (
        <ProgCodeComponent progCode={mapping.prog_code} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Default Value: </p>
      {mapping.compu_default_value ? (
        <CompuDefaultValueComponent
          defaultValue={mapping.compu_default_value}
        />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Compu Scales: </p>
      {mapping.compu_scales ? (
        <div>
          {mapping.compu_scales.map((entry, index) => (
            <div
              key={entry.ephemeral_id}
              className={clsx(
                {
                  'dark:bg-neutral-600 bg-neutral-300': index % 2 === 0,
                  'dark:bg-neutral-800 bg-neutral-100': index % 2 !== 0,
                },
                'rounded-md p-2 mb-2'
              )}
            >
              <CompuScaleComponent compuScale={entry} />
            </div>
          ))}
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function CompuDefaultValueComponent({
  defaultValue,
}: {
  defaultValue: CompuDefaultValue
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Data type: </p>
      {defaultValue.data_type ? (
        <DataTypeChip dataType={defaultValue.data_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Value: </p>
      {defaultValue.v !== undefined ? (
        <p>{defaultValue.v}</p>
      ) : defaultValue.vt !== undefined ? (
        <p>{defaultValue.vt}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Inverse Value: </p>
      {defaultValue.compu_inverse_value ? (
        <CompuConstComponent compuConst={defaultValue.compu_inverse_value} />
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function CompuScaleComponent({
  compuScale,
}: {
  compuScale: CompuScale
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Short Label: </p>
      {compuScale.short_label ? (
        <p>{compuScale.short_label}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Description: </p>
      {compuScale.description ? (
        <DescriptionComponent description={compuScale.description} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Domain type: </p>
      {compuScale.domain_type ? (
        <DataTypeChip dataType={compuScale.domain_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Range type: </p>
      {compuScale.range_type ? (
        <DataTypeChip dataType={compuScale.range_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Lower Limit: </p>
      {compuScale.lower_limit !== undefined ? (
        <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <LimitComponent limit={compuScale.lower_limit} />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Upper Limit: </p>
      {compuScale.upper_limit !== undefined ? (
        <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <LimitComponent limit={compuScale.upper_limit} />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Compu Const: </p>
      {compuScale.compu_const !== undefined ? (
        <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <CompuConstComponent compuConst={compuScale.compu_const} />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Compu Inverse Value: </p>
      {compuScale.compu_inverse_value !== undefined ? (
        <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <CompuConstComponent compuConst={compuScale.compu_inverse_value} />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Compu Rational Coeffs: </p>
      {compuScale.compu_rational_coeffs !== undefined ? (
        <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <CompuRationalCoeffsComponent
            rationalCoeffs={compuScale.compu_rational_coeffs}
          />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function CompuConstComponent({
  compuConst,
}: {
  compuConst: CompuConst
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Data type: </p>
      {compuConst.data_type ? (
        <DataTypeChip dataType={compuConst.data_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Value: </p>
      {compuConst.v !== undefined ? (
        <p>{compuConst.v}</p>
      ) : compuConst.vt !== undefined ? (
        <p>{compuConst.vt}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function CompuRationalCoeffsComponent({
  rationalCoeffs,
}: {
  rationalCoeffs: CompuRationalCoeffs
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Value type: </p>
      {rationalCoeffs.value_type ? (
        <DataTypeChip dataType={rationalCoeffs.value_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Numerators: </p>
      {rationalCoeffs.numerators && rationalCoeffs.numerators.length > 0 ? (
        <p>{rationalCoeffs.numerators.toString()}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Denominators: </p>
      {rationalCoeffs.denominators && rationalCoeffs.denominators.length > 0 ? (
        <p>{rationalCoeffs.denominators.toString()}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function ScaleContraintComponent({
  scale_constraint,
}: {
  scale_constraint: ScaleConstr
}) {
  return (
    <div className="grid grid-cols-[200px_minmax(200px,_1fr)] justify-items-start gap-1">
      <p className="font-medium">Short Label: </p>
      {scale_constraint.short_label ? (
        <p>{scale_constraint.short_label}</p>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Description: </p>
      {scale_constraint.description ? (
        <DescriptionComponent description={scale_constraint.description} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Value type: </p>
      {scale_constraint.value_type ? (
        <DataTypeChip dataType={scale_constraint.value_type} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Validity: </p>
      {scale_constraint.validity !== undefined ? (
        <ScaleConstraintValidityChip validity={scale_constraint.validity} />
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Lower Limit: </p>
      {scale_constraint.lower_limit !== undefined ? (
        <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <LimitComponent limit={scale_constraint.lower_limit} />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
      <p className="font-medium">Upper Limit: </p>
      {scale_constraint.upper_limit !== undefined ? (
        <div className="dark:bg-neutral-800 bg-neutral-100 rounded-md p-2">
          <LimitComponent limit={scale_constraint.upper_limit} />
        </div>
      ) : (
        <p className="italic">not specified</p>
      )}
    </div>
  )
}

export function ProgCodeComponent({ progCode }: { progCode: ProgCode }) {
  {
    /* TODO: Implement */
  }

  return (
    <div>
      <p>{progCode.code_file}: </p>
      <p>{progCode.entrypoint}: </p>
      <p>{progCode.ephemeral_id}</p>
    </div>
  )
}

export function AdminDataComponent({ adminData }: { adminData: AdminData }) {
  // TODO: Add AdminDataComponent to all details UI pages, wherever applicable (see diag-server.d.ts to check which elements have an admin-data property)
  return <div />
}
