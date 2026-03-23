// SPDX-License-Identifier: AGPL-3.0-only
import parse from 'html-react-parser'
import {
  getKeyValue,
  SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import React from 'react'

import { ColumnDefinition } from '@/types/index'
import { subtitle } from '@/components/primitives'
import { CompanyData, TeamMember } from '@/api/api-hooks'
import { TableColumnDropdown } from '@/components/custom-dropdowns'
import { cleanupHtmlContent } from '@/utils/utils'
import { useSelectionWithIndexedDB } from '@/storage/settings'

type CompDataType = Omit<CompanyData, 'team_members'>
type TeamMemberBasedCompanyData = CompDataType & {
  [Property in keyof TeamMember as `tm_${string & Property}`]: TeamMember[Property]
}

function resolveTeamMemberBasedCompanyData(
  compData: CompanyData[]
): TeamMemberBasedCompanyData[] {
  const result: TeamMemberBasedCompanyData[] = []

  for (let entry of compData) {
    if (entry.team_members) {
      for (let tm of entry.team_members) {
        result.push({
          data_id: entry.data_id,
          short_name: entry.short_name,
          description: entry.description,
          long_name: entry.long_name,
          tm_perma_id: tm.perma_id,
          tm_ephemeral_id: tm.ephemeral_id,
          tm_short_name: tm.short_name,
          tm_address: tm.address,
          tm_city: tm.city,
          tm_department: tm.department,
          tm_description: tm.description,
          tm_email: tm.email,
          tm_fax: tm.fax,
          tm_long_name: tm.long_name,
          tm_phone: tm.phone,
          tm_roles: tm.roles,
          tm_zipcode: tm.zipcode,
        })
      }
    } else {
      result.push({
        data_id: entry.data_id,
        short_name: entry.short_name,
        description: entry.description,
        long_name: entry.long_name,
        tm_perma_id: 'unresolved',
        tm_ephemeral_id: 0,
        tm_short_name: '',
        tm_address: '',
        tm_city: '',
        tm_department: '',
        tm_description: {},
        tm_email: '',
        tm_fax: '',
        tm_long_name: '',
        tm_phone: '',
        tm_roles: [],
        tm_zipcode: '',
      })
    }
  }

  return result
}

export default function CompanyDataComponent({
  pageId,
  companyDatas,
}: {
  pageId: string
  companyDatas: CompanyData[]
}) {
  const compData = resolveTeamMemberBasedCompanyData(companyDatas)

  const compDataColumns: ColumnDefinition[] = [
    {
      key: 'name',
      label: 'SHORT-NAME',
      group: 'Company',
      sortable: true,
    },
    {
      key: 'data_id',
      label: 'DATA-ID',
      group: 'Company',
      sortable: true,
    },
    {
      key: 'long_name',
      label: 'LONG-NAME',
      group: 'Company',
      sortable: true,
    },
    {
      key: 'description',
      label: 'DESCRIPTION',
      group: 'Company',
      sortable: true,
    },
    {
      key: 'tm_perma_id',
      label: 'MEMBER-PERMA-ID',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_ephemeral_id',
      label: 'MEMBER-EPHEMERAL-ID',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_short_name',
      label: 'MEMBER-SHORT-NAME',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_long_name',
      label: 'MEMBER-LONG-Name',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_address',
      label: 'MEMBER-ADDRESS',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_city',
      label: 'MEMBER-CITY',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_department',
      label: 'MEMBER-DEPARTMENT',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_description',
      label: 'MEMBER-DESCRIPTION',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_email',
      label: 'MEMBER-EMAIL',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_fax',
      label: 'MEMBER-FAX',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_phone',
      label: 'MEMBER-PHONE',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_roles',
      label: 'MEMBER-ROLES',
      group: 'Team',
      sortable: true,
    },
    {
      key: 'tm_zipcode',
      label: 'MEMBER-ZIP',
      group: 'Team',
      sortable: true,
    },
  ]

  const INITIAL_VISIBLE_COMP_DATA_COLUMNS = new Set([
    'name',
    'tm_short_name',
    'tm_long_name',
    'tm_department',
    'tm_email',
  ])

  const [visibleCompDataColumns, setVisibleCompDataColumns] =
    useSelectionWithIndexedDB(
      pageId,
      'table-visibleCompDataColumns',
      INITIAL_VISIBLE_COMP_DATA_COLUMNS
    )

  const [compDataSortDescriptor, setCompDataSortDescriptor] =
    React.useState<SortDescriptor>({
      column: 'name',
      direction: 'ascending',
    })

  const compDataHeaderColumns = React.useMemo(() => {
    if (visibleCompDataColumns === 'all') return compDataColumns

    return compDataColumns.filter((column) =>
      Array.from(visibleCompDataColumns).includes(column.key)
    )
  }, [visibleCompDataColumns])

  const sortedCompDataItems = React.useMemo(() => {
    return [...compData].sort((a: CompanyData, b: CompanyData) => {
      const first = a[compDataSortDescriptor.column as keyof CompanyData]
      const second = b[compDataSortDescriptor.column as keyof CompanyData]

      if (first && second) {
        const cmp = first < second ? -1 : first > second ? 1 : 0

        return compDataSortDescriptor.direction === 'descending' ? -cmp : cmp
      }

      return 0
    })
  }, [compDataSortDescriptor, compData])

  const compDataTopContent = React.useMemo(() => {
    return (
      <div className="flex flex-row justify-between">
        <div className="text-start">
          <div
            className={subtitle({ class: 'mt-4' })}
            data-testid="company-data-subtitle"
          >
            Company Data
          </div>
        </div>
        <div>
          <TableColumnDropdown
            columnList={compDataColumns}
            defaultVisibleColumns={INITIAL_VISIBLE_COMP_DATA_COLUMNS}
            tableName="companyData"
            visibleColumns={visibleCompDataColumns}
            visibleColumnsHandler={setVisibleCompDataColumns}
          />
        </div>
      </div>
    )
  }, [visibleCompDataColumns])

  return (
    <div className="flex table-auto">
      <Table
        isHeaderSticky
        isStriped
        aria-label="Company data table"
        classNames={{
          wrapper: 'max-h-[382px]',
        }}
        sortDescriptor={compDataSortDescriptor}
        topContent={compDataTopContent}
        topContentPlacement="outside"
        onSortChange={setCompDataSortDescriptor}
      >
        <TableHeader columns={compDataHeaderColumns}>
          {(column) => (
            <TableColumn key={column.key} allowsSorting={column.sortable}>
              {column.group}
              <br />
              {column.label}
            </TableColumn>
          )}
        </TableHeader>

        <TableBody items={sortedCompDataItems}>
          {(item) => (
            <TableRow key={item.tm_ephemeral_id} data-testid="company-data-row">
              {(columnKey) => (
                <TableCell>
                  {columnKey === 'name'
                    ? getKeyValue(item.short_name, columnKey)
                    : columnKey === 'tm_roles'
                      ? item.tm_roles
                          ?.map((value) => value)
                          ?.reduce(
                            (previousValue, currentValue) =>
                              previousValue + ', ' + currentValue,
                            ''
                          )
                      : columnKey === 'description'
                        ? item.description
                          ? parse(cleanupHtmlContent(item.description))
                          : ''
                        : columnKey === 'tm_description'
                          ? item.tm_description && item.tm_description.text
                            ? parse(
                                cleanupHtmlContent(item.tm_description.text)
                              )
                            : ''
                          : getKeyValue(item, columnKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
