// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { Alert } from '@heroui/alert'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { CircularProgress } from '@heroui/progress'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { PressEvent } from '@react-types/shared'

import client from '@/api/api-hooks'
import { headline, subtitle, title } from '@/components/primitives'
import DiagnosticDataSetsComponent from '@/components/diagnostic-data-sets'
import { resolveFileType } from '@/utils/utils'
import { JsonProblem } from '@/api/api-hooks'
import { PdxUploadApiError } from '@/components/api-error'

export default function Home() {
  const pageId = 'home'
  const router = useRouter()

  const [fileToUpload, setFileToUpload] = useState<File | undefined>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<JsonProblem | undefined>()

  const uploadFile = (_event: PressEvent, strictMode: boolean | undefined) => {
    if (fileToUpload) {
      const file_type = resolveFileType(fileToUpload.name)

      if (file_type) {
        setIsLoading(true)
        client
          .POST('/diagnostic-data-sets/{data-type}', {
            params: {
              path: { 'data-type': file_type },
            },
            body: {
              file_content: fileToUpload as unknown as string,
              metadata: {
                display_name: fileToUpload.name,
                strict_mode: strictMode,
              },
            },
            bodySerializer(body) {
              if (body) {
                const fd = new FormData()

                fd.append(
                  'file_content',
                  new Blob([fileToUpload], {
                    type: 'application/octet-stream',
                  })
                )
                fd.append(
                  'metadata',
                  JSON.stringify({
                    display_name: fileToUpload.name,
                    strict_mode: strictMode,
                  })
                )

                return fd
              } else {
                return undefined
              }
            },
          })
          .then((response) => {
            setIsLoading(false)
            if (response.data !== undefined) {
              setError(undefined)
              const data_set_id = response.data?.id

              router.push(`/odx-d?objectId=${data_set_id}`)
            }

            if (response.error !== undefined) {
              setError(response.error)
            }
          })
      }
    }
  }

  const uploadFileDefault = (event: PressEvent) => uploadFile(event, undefined)
  const uploadFileNonStrict = (event: PressEvent) => uploadFile(event, false)

  if (error) {
    return (
      <div className="pt-16">
        <PdxUploadApiError error={error} />

        <div className="flex flex-col pt-10 items-center justify-center gap-5">
          <Alert
            color="danger"
            description={
              <div>
                <p>
                  Uploading the file in &quot;non-strict&quot; mode might allow
                  to upload the file without an error.
                </p>
                <p>
                  However, the uploaded data may cause several other errors
                  while being traversed via the viewer, depending on the origin
                  reason why the file could not be uploaded in strict-mode.
                </p>
              </div>
            }
            title="Attention"
            variant="bordered"
          />
          <Button
            className="disabled:gray-200 disabled:bg-gray-50 disabled:text-gray-500"
            color="danger"
            disabled={isLoading}
            variant="shadow"
            onPress={uploadFileNonStrict}
          >
            Retry Upload in &quot;non-strict&quot; mode
          </Button>
          {isLoading ? <CircularProgress aria-label="Loading..." /> : <div />}
          <Button
            className="disabled:gray-200 disabled:bg-gray-50 disabled:text-gray-500"
            color="primary"
            disabled={isLoading}
            variant="shadow"
            onPress={() => {
              router.push('/')
              window.location.href = '/'
              router.refresh()
            }}
          >
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section className="flex flex-col items-center justify-center gap-4">
      <div className="inline-block text-center justify-center pt-16">
        <span className={title()}>Start exploring your diagnostic data</span>
        <div className={subtitle({ class: 'mt-4' })}>
          Open a PDX file to start
        </div>
      </div>

      <div className="flex mt-2 gap-4">
        <Input
          type="file"
          onChange={(e) =>
            setFileToUpload(e.target.files ? e.target.files[0] : undefined)
          }
        />
        <Button
          className="disabled:gray-200 disabled:bg-gray-50 disabled:text-gray-500"
          color="primary"
          disabled={isLoading}
          variant="shadow"
          onPress={uploadFileDefault}
        >
          Upload File
        </Button>

        {isLoading ? <CircularProgress aria-label="Loading..." /> : <div />}
      </div>

      <div className="flex gap-10 mt-10">
        <div className="text-left justify-left mt-2 gap-4">
          <span className={headline()}>Loaded Diagnostic Data Sets</span>
          <div className="flex pt-5">
            <DiagnosticDataSetsComponent pageId={pageId} />
          </div>
        </div>
      </div>
    </section>
  )
}
