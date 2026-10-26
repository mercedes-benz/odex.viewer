// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CodeBracketSquareIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Button } from '@heroui/button'
import React from 'react'

import {
  ParameterValueDocument,
  ParameterDocumentReview,
  ParameterImportMode,
  PreparedParameterImport,
  downloadParameterDocument,
} from '@/utils/parameter-value-documents'

export function ParameterValueTransfer({
  messageName,
  loadValues,
  buildTemplate,
  prepareImport,
  onApplied,
  disabled,
}: {
  messageName: string
  loadValues: () => Promise<ParameterValueDocument>
  buildTemplate: () => Promise<ParameterDocumentReview>
  prepareImport: (
    input: unknown,
    mode: ParameterImportMode
  ) => Promise<PreparedParameterImport>
  onApplied: () => void
  disabled: boolean
}) {
  const dialog = React.useRef<HTMLDialogElement>(null)
  const fileInput = React.useRef<HTMLInputElement>(null)
  const revision = React.useRef(0)
  const titleId = React.useId()
  const [text, setText] = React.useState('')
  const [mode, setMode] = React.useState<ParameterImportMode>('replace')
  const [prepared, setPrepared] = React.useState<PreparedParameterImport>()
  const [error, setError] = React.useState<string>()
  const [pending, setPending] = React.useState(false)
  const [notice, setNotice] = React.useState<string>()
  const filename = messageName.replace(/[^a-zA-Z0-9_-]/g, '_') || 'message'

  const run = async (action: () => Promise<void>) => {
    setPending(true)
    setError(undefined)
    setNotice(undefined)
    try {
      await action()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setPending(false)
    }
  }
  const open = (document: string) => {
    revision.current += 1
    setText(document)
    setPrepared(undefined)
    dialog.current?.showModal()
  }

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-2"
      data-testid="parameter-value-transfer"
    >
      <div
        aria-label="Parameter JSON actions"
        className="flex flex-wrap items-center gap-2"
        role="group"
      >
        <Button
          isDisabled={disabled || pending}
          size="sm"
          startContent={
            <CodeBracketSquareIcon aria-hidden="true" className="size-4" />
          }
          title="Edit physical inputs as JSON. parameter_values fills this table; for responses, optional request_parameter_values fills the triggering Request table."
          variant="flat"
          onPress={() =>
            void run(async () =>
              open(JSON.stringify(await loadValues(), null, 2))
            )
          }
        >
          Edit JSON
        </Button>
        <Button
          isDisabled={disabled || pending}
          size="sm"
          startContent={
            <ArrowUpTrayIcon aria-hidden="true" className="size-4" />
          }
          title="Open a JSON input or decoded-output file up to 2 MiB. Validate and preview its changes before applying them to the tables."
          variant="flat"
          onPress={() => fileInput.current?.click()}
        >
          Upload JSON
        </Button>
        <Button
          isDisabled={disabled || pending}
          size="sm"
          startContent={
            <ArrowDownTrayIcon aria-hidden="true" className="size-4" />
          }
          title="Download editable table inputs as JSON, including triggering-request values for responses. Constants and derived output values are excluded."
          variant="flat"
          onPress={() =>
            void run(async () =>
              downloadParameterDocument(
                `${filename}-values.json`,
                await loadValues()
              )
            )
          }
        >
          Download values
        </Button>
        <Button
          isDisabled={disabled || pending}
          size="sm"
          startContent={
            <DocumentArrowDownIcon aria-hidden="true" className="size-4" />
          }
          title="Download the ODX input structure with defaults. Fill null placeholders listed in required_parameters before importing. parameter_guidance lists allowed values, ranges, units, formats and examples for each path. Repeated fields include an example item; multiplexers use the first available case."
          variant="flat"
          onPress={() =>
            void run(async () => {
              const template = await buildTemplate()

              if (template.errors.length)
                throw new Error(template.errors.join('\n'))
              downloadParameterDocument(
                `${filename}-template.json`,
                template.document
              )
            })
          }
        >
          Download template
        </Button>
        <input
          ref={fileInput}
          accept=".json,application/json"
          aria-label="Upload parameter JSON file"
          className="hidden"
          type="file"
          onChange={(event) => {
            const file = event.target.files?.[0]

            event.target.value = ''
            if (file)
              void run(async () => {
                if (file.size > 2 * 1024 * 1024)
                  throw new Error('The JSON file must be smaller than 2 MiB.')
                open(await file.text())
              })
          }}
        />
      </div>
      {error && !dialog.current?.open ? (
        <p className="whitespace-pre-wrap text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          className="text-sm text-success-700 dark:text-success-400"
          role="status"
        >
          {notice}
        </p>
      ) : null}
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        className="m-auto max-h-[90vh] w-[min(52rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border border-default-200 bg-background p-4 text-foreground shadow-xl backdrop:bg-black/50"
        onClose={() => {
          revision.current += 1
          setPrepared(undefined)
          setError(undefined)
        }}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold" id={titleId}>
              Physical parameter values
            </h3>
            <p className="break-words text-sm text-default-500">
              {messageName}
            </p>
          </div>
          <Button
            isIconOnly
            aria-label="Close JSON editor"
            size="sm"
            title="Close JSON editor"
            variant="light"
            onPress={() => dialog.current?.close()}
          >
            <XMarkIcon aria-hidden="true" className="size-4" />
          </Button>
        </div>
        <textarea
          aria-label="Parameter values JSON"
          className="min-h-56 w-full resize-y rounded-sm border border-default-300 bg-content1 p-3 font-mono text-xs outline-none focus:border-primary"
          spellCheck={false}
          title="JSON object with parameter_values for this table. Response imports may also include request_parameter_values; omitting it leaves the Request table unchanged. Fill null placeholders using parameter_guidance; guidance is metadata, not imported values."
          value={text}
          onChange={(event) => {
            revision.current += 1
            setText(event.target.value)
            setPrepared(undefined)
            setError(undefined)
          }}
        />
        <div className="my-3 flex flex-wrap items-center justify-between gap-2">
          <div
            aria-label="JSON import mode"
            className="flex gap-1"
            role="group"
          >
            {(['replace', 'merge'] as const).map((item) => (
              <Button
                key={item}
                aria-pressed={mode === item}
                color={mode === item ? 'primary' : 'default'}
                size="sm"
                title={
                  item === 'replace'
                    ? 'Replace editable values in each supplied table and clear omitted parameters. An omitted request_parameter_values leaves the Request table unchanged.'
                    : 'Preserve omitted values and recursively merge structure objects. Arrays, including repeated items and case/value pairs, are replaced as a whole.'
                }
                variant="flat"
                onPress={() => {
                  revision.current += 1
                  setMode(item)
                  setPrepared(undefined)
                }}
              >
                {item === 'replace' ? 'Replace' : 'Merge'}
              </Button>
            ))}
          </div>
          <Button
            isDisabled={pending}
            size="sm"
            startContent={<EyeIcon aria-hidden="true" className="size-4" />}
            title="Validate JSON against the selected ODX definitions and preview all changes without modifying either table. Partial inputs are allowed; encoding still requires all mandatory values."
            onPress={() =>
              void run(async () => {
                setPrepared(undefined)
                const currentRevision = revision.current
                const input: unknown = JSON.parse(text)
                const preview = await prepareImport(input, mode)

                if (currentRevision === revision.current) setPrepared(preview)
              })
            }
          >
            Preview changes
          </Button>
        </div>
        {error ? (
          <p className="whitespace-pre-wrap text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        {prepared ? (
          <div className="space-y-3">
            {prepared.errors.length ? (
              <ul
                className="list-disc space-y-1 pl-5 text-sm text-danger"
                role="alert"
              >
                {prepared.errors.map((message, index) => (
                  <li key={`${index}-${message}`}>{message}</li>
                ))}
              </ul>
            ) : null}
            {prepared.warnings.length ? (
              <ul
                aria-label="Import warnings"
                className="list-disc space-y-1 pl-5 text-sm text-warning-700"
              >
                {prepared.warnings.map((message, index) => (
                  <li key={`${index}-${message}`}>{message}</li>
                ))}
              </ul>
            ) : null}
            <p className="text-sm font-medium">
              {prepared.changes.length}{' '}
              {prepared.changes.length === 1 ? 'change' : 'changes'}
            </p>
            <div className="max-h-48 overflow-auto">
              <table
                aria-label="Parameter import preview"
                className="w-full table-fixed text-left text-xs"
              >
                <thead>
                  <tr className="border-b border-default-200">
                    <th className="w-1/2 p-2">Parameter</th>
                    <th className="p-2">Current</th>
                    <th className="p-2">Imported</th>
                  </tr>
                </thead>
                <tbody>
                  {prepared.changes.map((change) => (
                    <tr
                      key={change.path}
                      className="border-b border-default-100 align-top"
                    >
                      <td className="break-all p-2">{change.path}</td>
                      <td className="break-all p-2 font-mono">
                        {JSON.stringify(change.before) ?? 'Not set'}
                      </td>
                      <td className="break-all p-2 font-mono">
                        {JSON.stringify(change.after) ?? 'Removed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
        <div className="mt-4 flex justify-end gap-2">
          <Button
            size="sm"
            title="Discard the preview and close without changing table values."
            variant="flat"
            onPress={() => dialog.current?.close()}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={!prepared || prepared.errors.length > 0 || pending}
            size="sm"
            startContent={<CheckIcon aria-hidden="true" className="size-4" />}
            title="Apply the previewed changes to the supplied request and response tables. Resolve all validation errors first."
            onPress={() => {
              try {
                prepared?.apply()
                onApplied()
                setNotice('Physical parameter values imported.')
                dialog.current?.close()
              } catch (reason) {
                setError(
                  reason instanceof Error ? reason.message : String(reason)
                )
              }
            }}
          >
            Apply values
          </Button>
        </div>
      </dialog>
    </div>
  )
}
