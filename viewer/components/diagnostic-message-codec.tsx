// SPDX-License-Identifier: AGPL-3.0-only
'use client'

import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Tab, Tabs } from '@heroui/tabs'
import React from 'react'

import client, {
  DiagnosticMessageCodecResult,
  JsonProblem,
  Request,
  Response,
} from '@/api/api-hooks'
import { DiagnosticCommTargetObjectIds } from '@/types/index'

type MessageValue = string | boolean

type MessageValueStore = {
  getValue: (messageId: string, path: string) => MessageValue | undefined
  setValue: (messageId: string, path: string, value: MessageValue) => void
  setValues: (messageId: string, values: Record<string, MessageValue>) => void
  subscribe: (messageId: string, listener: () => void) => () => void
}

const MessageValueStoreContext = React.createContext<
  MessageValueStore | undefined
>(undefined)

export function MessageValueStoreProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const values = React.useRef<Record<string, Record<string, MessageValue>>>({})
  const listeners = React.useRef(new Map<string, Set<() => void>>())

  const store = React.useMemo<MessageValueStore>(
    () => ({
      getValue: (messageId, path) => values.current[messageId]?.[path],
      setValue: (messageId, path, value) => {
        const messageValues = (values.current[messageId] ??= {})

        messageValues[path] = value
        listeners.current.get(messageId)?.forEach((listener) => listener())
      },
      setValues: (messageId, nextValues) => {
        values.current[messageId] = nextValues
        listeners.current.get(messageId)?.forEach((listener) => listener())
      },
      subscribe: (messageId, listener) => {
        const messageListeners = listeners.current.get(messageId) ?? new Set()

        messageListeners.add(listener)
        listeners.current.set(messageId, messageListeners)

        return () => {
          messageListeners.delete(listener)
          if (messageListeners.size === 0) {
            listeners.current.delete(messageId)
          }
        }
      },
    }),
    []
  )

  return (
    <MessageValueStoreContext.Provider value={store}>
      {children}
    </MessageValueStoreContext.Provider>
  )
}

export function useMessageValueStore() {
  return React.useContext(MessageValueStoreContext)
}

export type DiagnosticMessageKind = 'request' | 'response'

type DiagnosticMessage = Request | Response
type CodecMode = 'encode' | 'decode'

export function DiagnosticMessageCodecControls({
  message,
  messageKind,
  triggeringRequest,
  targetObjectIds,
  buildParameterValues,
  applyDecodedValues,
}: {
  message: DiagnosticMessage
  messageKind: DiagnosticMessageKind
  triggeringRequest?: Request
  targetObjectIds: DiagnosticCommTargetObjectIds
  buildParameterValues: (
    message: DiagnosticMessage
  ) => Promise<Record<string, unknown>>
  applyDecodedValues: (
    message: DiagnosticMessage,
    values: Record<string, unknown>
  ) => Promise<number>
}) {
  const [hexMessage, setHexMessage] = React.useState('')
  const [codecMode, setCodecMode] = React.useState<CodecMode>('encode')
  const [result, setResult] = React.useState<{
    mode: CodecMode
    data: DiagnosticMessageCodecResult
  }>()
  const [error, setError] = React.useState<string>()
  const [decodeNotice, setDecodeNotice] = React.useState<string>()
  const [pending, setPending] = React.useState(false)

  const path = {
    'diag-data-set-id': targetObjectIds.containerId,
    'variant-perma-id': targetObjectIds.variantId,
    'diag-comm-perma-id': targetObjectIds.diagCommId,
    'message-perma-id': message.perma_id ?? '',
  }

  const encodeMessage = async () => {
    setPending(true)
    setError(undefined)
    setDecodeNotice(undefined)
    setResult(undefined)

    try {
      if (!message.perma_id) {
        throw new Error('The selected message has no permanent ID.')
      }
      const parameterValues = await buildParameterValues(message)
      const body =
        messageKind === 'response'
          ? triggeringRequest
            ? {
                parameter_values: parameterValues,
                request_parameter_values:
                  await buildParameterValues(triggeringRequest),
              }
            : undefined
          : { parameter_values: parameterValues }

      if (body === undefined) {
        throw new Error(
          'The triggering request for this response is unavailable.'
        )
      }

      const response = await client.POST(
        '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}/messages/{message-perma-id}/encode',
        { params: { path }, body }
      )

      if (response.error) {
        setError(getApiErrorMessage(response.error))
      } else if (response.data) {
        setResult({ mode: 'encode', data: response.data })
        setHexMessage(response.data.hex_message)
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setPending(false)
    }
  }

  const decodeMessage = async () => {
    setPending(true)
    setError(undefined)
    setDecodeNotice(undefined)
    setResult(undefined)

    try {
      if (!message.perma_id) {
        throw new Error('The selected message has no permanent ID.')
      }
      if (hexMessage.trim() === '') {
        throw new Error('Enter a hexadecimal message to decode.')
      }

      const response = await client.POST(
        '/diagnostic-data-sets/{diag-data-set-id}/variants/{variant-perma-id}/diag-comms/{diag-comm-perma-id}/messages/{message-perma-id}/decode',
        { params: { path }, body: { hex_message: hexMessage } }
      )

      if (response.error) {
        setError(getApiErrorMessage(response.error))
      } else if (response.data) {
        const updatedValueCount = await applyDecodedValues(
          message,
          response.data.parameter_values
        )

        setResult({ mode: 'decode', data: response.data })
        setHexMessage(response.data.hex_message)
        setDecodeNotice(
          updatedValueCount === 0
            ? 'No editable parameter values were present; the table was left unchanged.'
            : `Updated ${updatedValueCount} editable parameter value${updatedValueCount === 1 ? '' : 's'} in this table.`
        )
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      setPending(false)
    }
  }

  const activeResult = result?.mode === codecMode ? result.data : undefined

  return (
    <section
      aria-label="Diagnostic message codec"
      className="mb-4 flex w-full flex-col items-start gap-3 border-b border-default-200 pb-4 text-left"
      data-testid="message-codec"
    >
      <Tabs
        aria-label="Message codec mode"
        className="w-full text-left"
        classNames={{
          base: 'items-start',
          tabList: 'justify-start',
          panel: 'w-full text-left',
        }}
        selectedKey={codecMode}
        variant="solid"
        onSelectionChange={(key) => {
          setCodecMode(key === 'decode' ? 'decode' : 'encode')
          setError(undefined)
        }}
      >
        <Tab key="encode" title="Encode">
          <div className="flex w-full flex-col items-start gap-2 pt-3 text-left">
            <Button
              color="primary"
              isDisabled={
                pending || (messageKind === 'response' && !triggeringRequest)
              }
              isLoading={pending}
              startContent={
                <ArrowUpTrayIcon aria-hidden="true" className="size-4" />
              }
              onPress={() => void encodeMessage()}
            >
              Encode message
            </Button>
            <div className="space-y-1 text-left text-small text-default-600">
              <p>Source: values entered in this parameter table.</p>
              {messageKind === 'response' ? (
                <p>
                  Triggering request:{' '}
                  <span className="font-medium text-foreground">
                    {triggeringRequest?.short_name ?? 'Unavailable'}
                  </span>
                  {triggeringRequest
                    ? ' · uses values from the Request table.'
                    : ''}
                </p>
              ) : null}
            </div>
          </div>
        </Tab>
        <Tab key="decode" title="Decode">
          <div className="flex w-full flex-wrap items-end justify-start gap-3 pt-3 text-left">
            <Input
              aria-label="Hex message to decode"
              className="min-w-64 flex-1"
              label="Hex message to decode"
              placeholder="e.g. 19 02 01"
              value={hexMessage}
              onValueChange={setHexMessage}
            />
            <Button
              color="primary"
              isDisabled={pending}
              isLoading={pending}
              startContent={
                <ArrowDownTrayIcon aria-hidden="true" className="size-4" />
              }
              onPress={() => void decodeMessage()}
            >
              Decode message
            </Button>
          </div>
        </Tab>
      </Tabs>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
      {activeResult ? (
        <div
          aria-live="polite"
          className="flex w-full flex-col items-start gap-2 text-left"
          data-testid="message-codec-result"
        >
          {codecMode === 'decode' ? (
            <>
              <span
                className="text-small text-success-700 dark:text-success-400"
                data-testid="decoded-values-summary"
              >
                {decodeNotice}
              </span>
              <details>
                <summary className="cursor-pointer text-small font-semibold">
                  Physical parameter values
                </summary>
                <pre
                  className="mt-2 max-h-64 w-full overflow-auto rounded-small bg-default-100 p-3 text-xs"
                  data-testid="message-codec-physical-values"
                >
                  {JSON.stringify(activeResult.parameter_values, null, 2)}
                </pre>
              </details>
              <details>
                <summary className="cursor-pointer text-small font-semibold">
                  Normalized message bytes
                </summary>
                <code className="mt-2 block" data-testid="message-codec-hex">
                  {activeResult.hex_message}
                </code>
              </details>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-small font-semibold">
                  Encoded message bytes
                </span>
                <code data-testid="message-codec-hex">
                  {activeResult.hex_message}
                </code>
              </div>
              <details>
                <summary className="cursor-pointer text-small font-semibold">
                  Physical parameter values
                </summary>
                <pre className="mt-2 max-h-64 overflow-auto rounded-small bg-default-100 p-3 text-xs">
                  {JSON.stringify(activeResult.parameter_values, null, 2)}
                </pre>
              </details>
            </>
          )}
        </div>
      ) : null}
    </section>
  )
}

function getApiErrorMessage(error: JsonProblem) {
  return (
    error.exception ??
    error.detail ??
    error.title ??
    'The codec request failed.'
  )
}
