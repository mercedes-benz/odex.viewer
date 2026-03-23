// SPDX-License-Identifier: AGPL-3.0-only
import { Alert } from '@heroui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@heroui/table'

import { JsonProblem } from '@/api/api-hooks'

export default function ApiError({ error }: { error: JsonProblem }) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full">
        <Alert color="danger" title={error.title} />
      </div>
      <div className="mt-2 w-full">
        <Table
          hideHeader
          isStriped
          aria-label="Error details"
          className="text-danger"
        >
          <TableHeader>
            <TableColumn>LABEL</TableColumn>
            <TableColumn>VALUE</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow key="Type">
              <TableCell>Type</TableCell>
              <TableCell>{error.type}</TableCell>
            </TableRow>
            <TableRow key="Status">
              <TableCell>Status</TableCell>
              <TableCell>{error.status}</TableCell>
            </TableRow>
            <TableRow key="Instance">
              <TableCell>Instance</TableCell>
              <TableCell>{error.instance}</TableCell>
            </TableRow>
            <TableRow key="Detail">
              <TableCell>Detail</TableCell>
              <TableCell>{error.detail}</TableCell>
            </TableRow>
            <TableRow key="Exception">
              <TableCell>Exception</TableCell>
              <TableCell>{error.exception}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export function PdxUploadApiError({ error }: { error: JsonProblem }) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full">
        <Alert color="danger" title={error.title} />
      </div>
      <div className="mt-2 w-full">
        <Table
          hideHeader
          isStriped
          aria-label="Error details"
          className="text-danger"
        >
          <TableHeader>
            <TableColumn>LABEL</TableColumn>
            <TableColumn>VALUE</TableColumn>
          </TableHeader>
          <TableBody>
            <TableRow key="Type">
              <TableCell>Type</TableCell>
              <TableCell>{error.type}</TableCell>
            </TableRow>
            <TableRow key="Status">
              <TableCell>Status</TableCell>
              <TableCell>{error.status}</TableCell>
            </TableRow>
            <TableRow key="Instance">
              <TableCell>Instance</TableCell>
              <TableCell>{error.instance}</TableCell>
            </TableRow>
            <TableRow key="Detail">
              <TableCell>Detail</TableCell>
              <TableCell>{error.detail}</TableCell>
            </TableRow>
            <TableRow key="Exception">
              <TableCell>Exception</TableCell>
              <TableCell>{error.exception}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
