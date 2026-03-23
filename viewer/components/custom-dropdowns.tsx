// SPDX-License-Identifier: AGPL-3.0-only
import { Button } from '@heroui/button'
import { getKeyValue } from '@heroui/shared-utils'
import {
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  DropdownTrigger,
} from '@heroui/dropdown'
import { Selection } from '@heroui/table'
import { SharedSelection } from '@heroui/system'
import { AsyncListData } from '@react-stately/data'

import { ChevronDownIcon } from '@/components/icons'
import {
  ArrayValueExtractorFunc,
  ColumnDefinition,
  ParameterColumnDefinition,
  DopColumnDefinition,
  ValueExtractorFunc,
} from '@/types'
import {
  count_elements,
  count_elements_in_object_collections_with_extractFunc,
  count_elements_in_object_collections_with_id,
  count_elements_with_extractFunc,
  get_unique_items,
  get_unique_items_withExtractorFunc,
  isAsyncListData,
} from '@/utils/utils'

export function TableFilterDropdown<Type extends object>({
  filterItems,
  filterKey,
  filterLabel,
  selectedFilters,
  selectedFiltersHandler,
}: {
  filterItems: AsyncListData<Type> | Type[]
  filterKey: string
  filterLabel: string
  selectedFilters: Selection
  selectedFiltersHandler: (keys: SharedSelection) => void
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color={
            selectedFilters === 'all' || selectedFilters.size == 0
              ? 'default'
              : 'warning'
          }
          size="sm"
          variant="shadow"
        >
          Filter
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filter Dropdown"
        classNames={{
          list: 'max-h-[250px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={selectedFilters}
        selectionMode="multiple"
        variant="flat"
        onAction={(key) => {
          if (key === 'unselect-all') {
            selectedFiltersHandler(new Set([]))
          }
        }}
        onSelectionChange={selectedFiltersHandler}
      >
        <DropdownSection
          showDivider
          items={get_unique_items<Type>(
            isAsyncListData<Type>(filterItems)
              ? filterItems.items
              : filterItems,
            filterKey
          )}
          title={filterLabel}
        >
          {(item) => (
            <DropdownItem key={getKeyValue(item, filterKey)}>
              {getKeyValue(item, filterKey) +
                ` (${count_elements<Type>(
                  isAsyncListData<Type>(filterItems)
                    ? filterItems.items
                    : filterItems,
                  item,
                  filterKey
                )})`}
            </DropdownItem>
          )}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="unselect-all">Clear selection</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export function TableFilterObjectDropdown<Type extends object>({
  filterItems,
  filterKey,
  filterLabel,
  filterObjectProperty,
  selectedFilters,
  selectedFiltersHandler,
}: {
  filterItems: AsyncListData<Type>
  filterKey: string
  filterLabel: string
  filterObjectProperty: string
  selectedFilters: Selection
  selectedFiltersHandler: (keys: SharedSelection) => void
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color={
            selectedFilters === 'all' || selectedFilters.size == 0
              ? 'default'
              : 'warning'
          }
          size="sm"
          variant="shadow"
        >
          Filter
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filter Dropdown"
        classNames={{
          list: 'max-h-[250px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={selectedFilters}
        selectionMode="multiple"
        variant="flat"
        onAction={(key) => {
          if (key === 'unselect-all') {
            selectedFiltersHandler(new Set([]))
          }
        }}
        onSelectionChange={selectedFiltersHandler}
      >
        <DropdownSection
          showDivider
          items={get_unique_items<Type>(
            filterItems.items,
            filterKey,
            filterObjectProperty
          )}
          title={filterLabel}
        >
          {(item) => (
            <DropdownItem
              key={getKeyValue(
                getKeyValue(item, filterKey),
                filterObjectProperty
              )}
            >
              {getKeyValue(getKeyValue(item, filterKey), filterObjectProperty) +
                ` (${count_elements<Type>(filterItems.items, item, filterKey, filterObjectProperty)})`}
            </DropdownItem>
          )}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="unselect-all">Clear selection</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export function TableFilterObjectCollectionDropdown<Type extends object>({
  filterItems,
  filterKey,
  filterLabel,
  objectPropertyName,
  selectedFilters,
  selectedFiltersHandler,
  idLabelMappings,
}: {
  filterItems: AsyncListData<Type>
  filterKey: string
  filterLabel: string
  objectPropertyName: string
  selectedFilters: Selection
  selectedFiltersHandler: (keys: SharedSelection) => void
  idLabelMappings: Map<string, string>
}) {
  const dropdownItems = Array.from(
    idLabelMappings.entries().map((value) => {
      return { id: value[0], label: value[1] }
    })
  )

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color={
            selectedFilters === 'all' || selectedFilters.size == 0
              ? 'default'
              : 'warning'
          }
          size="sm"
          variant="shadow"
        >
          Filter
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filter Dropdown"
        classNames={{
          list: 'max-h-[250px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={selectedFilters}
        selectionMode="multiple"
        variant="flat"
        onAction={(key) => {
          if (key === 'unselect-all') {
            selectedFiltersHandler(new Set([]))
          }
        }}
        onSelectionChange={selectedFiltersHandler}
      >
        <DropdownSection showDivider items={dropdownItems} title={filterLabel}>
          {(item) => (
            <DropdownItem key={item.id}>
              {item.label +
                ` (${count_elements_in_object_collections_with_id<Type>(filterItems.items, item.id, filterKey, objectPropertyName)})`}
            </DropdownItem>
          )}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="unselect-all">Clear selection</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export function TableColumnDropdown({
  columnList,
  visibleColumns,
  defaultVisibleColumns,
  visibleColumnsHandler,
  tableName,
}: {
  columnList: ColumnDefinition[]
  visibleColumns: Selection
  defaultVisibleColumns: Set<string>
  visibleColumnsHandler: (keys: SharedSelection) => void
  tableName: string
}) {
  return (
    <Dropdown aria-labelledby="Columns Button">
      <DropdownTrigger className="hidden sm:flex">
        <Button
          aria-label="Columns Button"
          color={
            visibleColumns !== 'all' &&
            visibleColumns.symmetricDifference(defaultVisibleColumns).size == 0
              ? 'default'
              : 'warning'
          }
          data-testid={`${tableName}-columns-dropdown-button`}
          endContent={<ChevronDownIcon className="text-small" />}
          variant="shadow"
        >
          Columns
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Table Columns"
        classNames={{
          list: 'max-h-[250px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={visibleColumns}
        selectionMode="multiple"
        onAction={(key) => {
          if (key === 'reset-to-default') {
            visibleColumnsHandler(new Set(defaultVisibleColumns))
          } else if (key === 'select-all') {
            visibleColumnsHandler(
              new Set(columnList.flatMap((entry) => entry.key))
            )
          }
        }}
        onSelectionChange={visibleColumnsHandler}
      >
        <DropdownSection showDivider>
          {columnList.map((column) => (
            <DropdownItem
              key={column.key}
              data-testid={`${tableName}-columns-dropdown-entry`}
            >
              {column.label}
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="select-all">Select all</DropdownItem>
          <DropdownItem key="reset-to-default">Reset to default</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export function ParameterTableColumnDropdown({
  columnList,
  visibleColumns,
  defaultVisibleColumns,
  visibleColumnsHandler,
}: {
  columnList: ParameterColumnDefinition[]
  visibleColumns: Selection
  defaultVisibleColumns: Set<string>
  visibleColumnsHandler: (keys: SharedSelection) => void
}) {
  const parameterTypeMapping = new Map<string, string[]>()

  for (const column of columnList) {
    if (column.relatedParameterTypes !== undefined) {
      for (const paramType of column.relatedParameterTypes) {
        if (parameterTypeMapping.has(paramType)) {
          parameterTypeMapping.get(paramType)?.push(column.key)
        } else {
          parameterTypeMapping.set(paramType, [column.key])
        }
      }
    }
  }

  return (
    <Dropdown aria-labelledby="Columns Button">
      <DropdownTrigger className="hidden sm:flex">
        <Button
          aria-label="Columns Button"
          color={
            visibleColumns !== 'all' &&
            visibleColumns.symmetricDifference(defaultVisibleColumns).size == 0
              ? 'default'
              : 'warning'
          }
          endContent={<ChevronDownIcon className="text-small" />}
          variant="shadow"
        >
          Columns
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Table Columns"
        classNames={{
          list: 'max-h-[400px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={visibleColumns}
        selectionMode="multiple"
        onAction={(key) => {
          if (key === 'reset-to-default') {
            visibleColumnsHandler(new Set(defaultVisibleColumns))
          } else if (key === 'select-all') {
            visibleColumnsHandler(
              new Set(columnList.flatMap((entry) => entry.key))
            )
          } else if (parameterTypeMapping.has(key.toString())) {
            visibleColumnsHandler(
              new Set(defaultVisibleColumns).union(
                new Set(parameterTypeMapping.get(key.toString()))
              )
            )
          }
        }}
        onSelectionChange={visibleColumnsHandler}
      >
        <DropdownSection showDivider>
          {columnList.map((column) => (
            <DropdownItem key={column.key}>{column.label}</DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection showDivider title="Parameter Types">
          {Array.from(parameterTypeMapping.keys()).map((typeKey) => (
            <DropdownItem key={typeKey}>{typeKey}</DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="select-all">Select all</DropdownItem>
          <DropdownItem key="reset-to-default">Reset to default</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export function DopTableColumnDropdown({
  columnList,
  visibleColumns,
  defaultVisibleColumns,
  visibleColumnsHandler,
}: {
  columnList: DopColumnDefinition[]
  visibleColumns: Selection
  defaultVisibleColumns: Set<string>
  visibleColumnsHandler: (keys: SharedSelection) => void
}) {
  const parameterTypeMapping = new Map<string, string[]>()

  for (const column of columnList) {
    if (column.relatedDopTypes !== undefined) {
      for (const paramType of column.relatedDopTypes) {
        if (parameterTypeMapping.has(paramType)) {
          parameterTypeMapping.get(paramType)?.push(column.key)
        } else {
          parameterTypeMapping.set(paramType, [column.key])
        }
      }
    }
  }

  return (
    <Dropdown aria-labelledby="Columns Button">
      <DropdownTrigger className="hidden sm:flex">
        <Button
          aria-label="Columns Button"
          color={
            visibleColumns !== 'all' &&
            visibleColumns.symmetricDifference(defaultVisibleColumns).size == 0
              ? 'default'
              : 'warning'
          }
          endContent={<ChevronDownIcon className="text-small" />}
          variant="shadow"
        >
          Columns
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        aria-label="Table Columns"
        classNames={{
          list: 'max-h-[400px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={visibleColumns}
        selectionMode="multiple"
        onAction={(key) => {
          if (key === 'reset-to-default') {
            visibleColumnsHandler(new Set(defaultVisibleColumns))
          } else if (key === 'select-all') {
            visibleColumnsHandler(
              new Set(columnList.flatMap((entry) => entry.key))
            )
          } else if (parameterTypeMapping.has(key.toString())) {
            visibleColumnsHandler(
              new Set(defaultVisibleColumns).union(
                new Set(parameterTypeMapping.get(key.toString()))
              )
            )
          }
        }}
        onSelectionChange={visibleColumnsHandler}
      >
        <DropdownSection showDivider>
          {columnList.map((column) => (
            <DropdownItem key={column.key}>{column.label}</DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection showDivider title="DOP Types">
          {Array.from(parameterTypeMapping.keys()).map((typeKey) => (
            <DropdownItem key={typeKey}>{typeKey}</DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="select-all">Select all</DropdownItem>
          <DropdownItem key="reset-to-default">Reset to default</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export function TableFilterDropdownWithExtractorFunc<Type extends object>({
  filterItems,
  filterValueExtractorFunc,
  filterLabel,
  selectedFilters,
  selectedFiltersHandler,
}: {
  filterItems: AsyncListData<Type>
  filterValueExtractorFunc: ValueExtractorFunc<Type>
  filterLabel: string
  selectedFilters: Selection
  selectedFiltersHandler: (keys: SharedSelection) => void
}) {
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color={
            selectedFilters === 'all' || selectedFilters.size == 0
              ? 'default'
              : 'warning'
          }
          size="sm"
          variant="shadow"
        >
          Filter
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filter Dropdown"
        classNames={{
          list: 'max-h-[250px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={selectedFilters}
        selectionMode="multiple"
        variant="flat"
        onAction={(key) => {
          if (key === 'unselect-all') {
            selectedFiltersHandler(new Set([]))
          }
        }}
        onSelectionChange={selectedFiltersHandler}
      >
        <DropdownSection
          showDivider
          items={get_unique_items_withExtractorFunc<Type>(
            filterItems.items,
            filterValueExtractorFunc
          )}
          title={filterLabel}
        >
          {(item) => {
            const itemValue = filterValueExtractorFunc(item)

            return (
              <DropdownItem key={itemValue ? itemValue : ''}>
                {filterValueExtractorFunc(item) +
                  ` (${count_elements_with_extractFunc<Type>(filterItems.items, item, filterValueExtractorFunc)})`}
              </DropdownItem>
            )
          }}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="unselect-all">Clear selection</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}

export function TableFilterObjectCollectionWithExtractorFuncDropdown<
  Type extends object,
>({
  filterItems,
  filterValueExtractorFunc,
  filterLabel,
  selectedFilters,
  selectedFiltersHandler,
  idLabelMappings,
}: {
  filterItems: AsyncListData<Type>
  filterValueExtractorFunc: ArrayValueExtractorFunc<Type>
  filterLabel: string
  selectedFilters: Selection
  selectedFiltersHandler: (keys: SharedSelection) => void
  idLabelMappings: Map<string, string>
}) {
  const dropdownItems = Array.from(
    idLabelMappings.entries().map((value) => {
      return { id: value[0], label: value[1] }
    })
  )

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button
          color={
            selectedFilters === 'all' || selectedFilters.size == 0
              ? 'default'
              : 'warning'
          }
          size="sm"
          variant="shadow"
        >
          Filter
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Filter Dropdown"
        classNames={{
          list: 'max-h-[250px] overflow-y-auto',
        }}
        closeOnSelect={false}
        selectedKeys={selectedFilters}
        selectionMode="multiple"
        variant="flat"
        onAction={(key) => {
          if (key === 'unselect-all') {
            selectedFiltersHandler(new Set([]))
          }
        }}
        onSelectionChange={selectedFiltersHandler}
      >
        <DropdownSection showDivider items={dropdownItems} title={filterLabel}>
          {(item) => (
            <DropdownItem key={item.id}>
              {item.label +
                ` (${count_elements_in_object_collections_with_extractFunc<Type>(filterItems.items, item.id, filterValueExtractorFunc)})`}
            </DropdownItem>
          )}
        </DropdownSection>
        <DropdownSection title="Selection">
          <DropdownItem key="unselect-all">Clear selection</DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  )
}
