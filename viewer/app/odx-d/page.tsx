// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Link } from '@heroui/link'
import { CircularProgress } from '@heroui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'
import parse from 'html-react-parser'
import { useSearchParams } from 'next/navigation'

import { useQuery } from '@/api/api-hooks'
import ApiError from '@/components/api-error'
import {
  DefaultBreadcrumbs,
  getOdxD_Breadcrumps,
  odxdStaticBreadcrumbs,
} from '@/components/breadcrumps'
import { LinkButton } from '@/components/commons'
import { DiagnosticVariantsComponent } from '@/components/diag-variants'
import { OdxDatabasesComponent } from '@/components/odx-databases'
import { headline, subtitle, title } from '@/components/primitives'
import { ResetPageSettingsButton } from '@/storage/settings'
import { cleanupHtmlContent } from '@/utils/utils'

export default function OdxDPage() {
  const pageId = 'odx-d'

  const searchParams = useSearchParams()
  const objectIdQueryParam = searchParams.has('objectId')
    ? searchParams.get('objectId')
    : null
  const objectId = objectIdQueryParam !== null ? objectIdQueryParam : undefined

  const {
    data: data_meta,
    error: error_meta,
    isLoading: isLoading_meta,
  } = useQuery(
    '/diagnostic-data-sets/{diag-data-set-id}/metadata/{perma-id}',
    {
      params: {
        path: {
          'diag-data-set-id': objectId ? objectId : 'unresolved',
          'perma-id': objectId ? objectId : 'unresolved',
        },
        query: { resolve_main_diag_layer: true },
      },
    },
    { errorRetryCount: 0 }
  )

  if (isLoading_meta) return <CircularProgress aria-label="Loading..." />
  // Only display API error, if an objectId is given
  if (objectId) {
    if (error_meta) return <ApiError error={error_meta} />
  }

  return objectId && data_meta ? (
    <div>
      <DefaultBreadcrumbs
        breadcrumbs={getOdxD_Breadcrumps({
          odxd_shortName: data_meta.short_name ? data_meta.short_name : '',
          odxd_objectId: objectId ? objectId : '',
          isLastBreadcrumbSegment: true,
        })}
      />
      <section>
        <h1 className={title()} data-testid="odx-d-title">
          ODX-D
        </h1>
        <p className="mt-4" />
        <h2 className={headline()} data-testid="odx-d-shortname">
          {data_meta.short_name}
        </h2>

        <ResetPageSettingsButton page={pageId} />

        <div className="flex flex-row gap-4">
          <div className="basis-1/2">
            <div className="text-start">
              <div
                className={subtitle({ class: 'mt-4' })}
                data-testid="odx-d-metadata"
              >
                Metadata
              </div>
            </div>

            <div className="flex table-auto justify-start gap-10">
              <Table hideHeader isStriped aria-label="ODX-D metadata table">
                <TableHeader>
                  <TableColumn>VARIANT</TableColumn>
                  <TableColumn>ROLE</TableColumn>
                </TableHeader>
                <TableBody>
                  <TableRow key="1">
                    <TableCell>
                      <b>ODX-Model-Version</b>
                    </TableCell>
                    <TableCell>{data_meta.odx_model_version}</TableCell>
                  </TableRow>
                  <TableRow key="2">
                    <TableCell>
                      <b>Long Name</b>
                    </TableCell>
                    <TableCell>{data_meta.long_name}</TableCell>
                  </TableRow>
                  <TableRow key="3">
                    <TableCell>
                      <b>Short Name</b>
                    </TableCell>
                    <TableCell>{data_meta.short_name}</TableCell>
                  </TableRow>
                  <TableRow key="4">
                    <TableCell>
                      <b>ID</b>
                    </TableCell>
                    <TableCell>{data_meta.odx_id}</TableCell>
                  </TableRow>
                  <TableRow key="5">
                    <TableCell>
                      <b>Doc Revision</b>
                    </TableCell>
                    <TableCell>
                      <div className="flex align-center gap-10">
                        <Link
                          href={`/revision/details?objectId=${objectId}&revisionLabel=${data_meta.revision}`}
                        >
                          {data_meta.revision}
                        </Link>
                        <LinkButton
                          dataTestId="odx-d-revision-history-link"
                          href={`/revision?objectId=${objectId}`}
                          label="Revision History"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow key="6">
                    <TableCell className="align-top">
                      <b>Description</b>
                    </TableCell>
                    <TableCell>
                      {data_meta.description
                        ? parse(cleanupHtmlContent(data_meta.description))
                        : ''}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="basis-1/2">
            <div className="text-start">
              <div className={subtitle({ class: 'mt-4' })}>
                ECU & Base Variants
              </div>
            </div>
            <DiagnosticVariantsComponent objectId={objectId} />
          </div>
        </div>
      </section>
    </div>
  ) : (
    <div>
      <DefaultBreadcrumbs breadcrumbs={odxdStaticBreadcrumbs} />
      <section>
        <div className="text-center mb-10">
          <div
            className={`${title()} whitespace-nowrap`}
            data-testid="odx-d-title"
          >
            ODX-D
          </div>
        </div>

        <div className="mb-5">
          <ResetPageSettingsButton page={pageId} />
        </div>

        <div className="flex flex-col gap-4">
          <OdxDatabasesComponent pageId={pageId} />
        </div>
      </section>
    </div>
  )
}
