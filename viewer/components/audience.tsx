// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Accordion, AccordionItem } from '@heroui/accordion'
import { CircularProgress } from '@heroui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'

import {
  AdditionalAudience,
  AudienceResolved,
  isAudienceResolved,
  useQuery,
} from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import { DescriptionComponent } from '@/components/commons'

export function AudienceComponent({
  audienceEphemeralId,
}: {
  audienceEphemeralId: number | undefined
}) {
  // Request data from server

  const {
    data: data,
    error: error,
    isLoading: isLoading,
  } = useQuery('/structured-data/{schema-name}/{ephemeral-id}', {
    params: {
      path: {
        'schema-name': 'AudienceResolved',
        'ephemeral-id': audienceEphemeralId ? audienceEphemeralId : 0,
      },
    },
  })

  if (error) return <ApiError error={error} />
  if (isLoading || !data) return <CircularProgress aria-label="Loading..." />

  if (!isAudienceResolved(data))
    return (
      <ApiError
        error={{
          type: '/problem/type',
          title:
            'Data requested from server could not be mapped to the correct type',
          status: 500,
          detail:
            'Something went wrong during the type resolution of the data received from the server.',
        }}
      />
    )

  const audienceData = data as AudienceResolved

  return (
    <Table hideHeader isStriped aria-label="Audience Table">
      <TableHeader>
        <TableColumn>KEY</TableColumn>
        <TableColumn>VALUE</TableColumn>
      </TableHeader>
      <TableBody>
        {audienceData.enabled_audiences ? (
          <TableRow key="enabled_audiences">
            <TableCell className="font-bold" width={200}>
              Enabled Audiences
            </TableCell>
            <TableCell>
              <AdditionalAudienceComponent
                additionalAudiences={audienceData.enabled_audiences}
              />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        {audienceData.disabled_audiences ? (
          <TableRow key="disabled_audiences">
            <TableCell className="font-bold">Disabled Audiences</TableCell>
            <TableCell>
              <AdditionalAudienceComponent
                additionalAudiences={audienceData.disabled_audiences}
              />
            </TableCell>
          </TableRow>
        ) : (
          <></>
        )}
        <TableRow key="is_development">
          <TableCell className="font-bold">Is Development</TableCell>
          <TableCell>
            <p>
              {audienceData?.is_development !== undefined
                ? audienceData.is_development.toString()
                : 'undefined'}
            </p>
          </TableCell>
        </TableRow>
        <TableRow key="is_supplier">
          <TableCell className="font-bold">Is Supplier</TableCell>
          <TableCell>
            <p>
              {audienceData?.is_supplier !== undefined
                ? audienceData.is_supplier.toString()
                : 'undefined'}
            </p>
          </TableCell>
        </TableRow>
        <TableRow key="is_manufacturing">
          <TableCell className="font-bold">Is Manufacturing</TableCell>
          <TableCell>
            <p>
              {audienceData?.is_manufacturing !== undefined
                ? audienceData.is_manufacturing.toString()
                : 'undefined'}
            </p>
          </TableCell>
        </TableRow>
        <TableRow key="is_aftersales">
          <TableCell className="font-bold">Is Aftersales</TableCell>
          <TableCell>
            <p>
              {audienceData?.is_aftersales !== undefined
                ? audienceData.is_aftersales.toString()
                : 'undefined'}
            </p>
          </TableCell>
        </TableRow>
        <TableRow key="is_aftermarket">
          <TableCell className="font-bold">Is Aftermarket</TableCell>
          <TableCell>
            <p>
              {audienceData?.is_aftermarket !== undefined
                ? audienceData.is_aftermarket.toString()
                : 'undefined'}
            </p>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}

export function AdditionalAudienceComponent({
  additionalAudiences,
}: {
  additionalAudiences: AdditionalAudience[]
}) {
  return additionalAudiences ? (
    <Accordion
      isCompact
      itemClasses={{
        base: 'rounded',
        title: 'text-sm font-bold',
        content: 'pb-2 text-left flex items-start',
        indicator: 'font-bold',
        trigger: 'data-[hover=true]:underline rounded',
      }}
      variant="light"
    >
      {additionalAudiences.map((entry, index) => (
        <AccordionItem
          key={index}
          aria-label={entry.short_name}
          title={entry.short_name}
        >
          <div className="grid grid-cols-2 gap-1">
            <p>Short Name: </p>
            <p className="italic">{entry.short_name}</p>
            <p>Long Name: </p>
            <p className="italic">{entry.long_name}</p>
            {entry.description && entry.description.text ? (
              <div>
                <p>Description: </p>
                <p className="italic">
                  <DescriptionComponent
                    description={entry.description}
                    enableUnfolding={true}
                    maxDisplayLengthLimit={200}
                  />
                </p>
              </div>
            ) : (
              <></>
            )}
            <p>ODX-ID: </p>
            <p className="italic">{entry.odx_id?.local_id}</p>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  ) : null
}
