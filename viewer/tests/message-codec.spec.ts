// SPDX-License-Identifier: AGPL-3.0-only

import type { Download, Locator } from '@playwright/test'
import type { ParameterValueDocument } from '@/utils/parameter-value-documents'

import { readFile } from 'node:fs/promises'

import { expect, test } from '@playwright/test'

async function downloadedValues(
  download: Download
): Promise<ParameterValueDocument> {
  const path = await download.path()

  if (!path) throw new Error('The JSON download is unavailable.')

  return JSON.parse(await readFile(path, 'utf8')) as ParameterValueDocument
}

test('JSON parameter documents preview, import and download', async ({
  page,
}) => {
  test.slow()
  await page.goto(
    '/diagnostic-comm?objectId=cdf68a3c9e6278ed1ded08198ec4376b&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )
  const request = page.getByRole('region', { name: 'Request', exact: true })
  const response = page.getByRole('region', {
    name: 'Positive Responses',
    exact: true,
  })
  const responseCodec = response.getByRole('region', {
    name: 'Diagnostic message codec',
  })
  const dialog = page.getByRole('dialog', { name: 'Physical parameter values' })

  await expect(
    responseCodec.getByRole('button', { name: 'Edit JSON', exact: true })
  ).toHaveAccessibleDescription(/parameter_values.*request_parameter_values/)
  await expect(
    responseCodec.getByRole('button', { name: 'Download template' })
  ).toHaveAccessibleDescription(/null placeholders.*required_parameters/)

  await responseCodec
    .getByRole('button', { name: 'Edit JSON', exact: true })
    .click()
  await expect(
    dialog.getByRole('button', { name: 'Replace', exact: true })
  ).toHaveAccessibleDescription(/clear omitted parameters/)
  await expect(
    dialog.getByRole('button', { name: 'Merge', exact: true })
  ).toHaveAccessibleDescription(/Arrays.*replaced as a whole/)
  await expect(
    dialog.getByRole('button', { name: 'Preview changes' })
  ).toHaveAccessibleDescription(/without modifying either table/)
  await dialog.getByLabel('Parameter values JSON').fill(
    JSON.stringify({
      parameter_values: { sault_time: 42 },
      request_parameter_values: { forward_soberness_check: 18, num_flips: 3 },
    })
  )
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(
    dialog.getByRole('table', { name: 'Parameter import preview' })
  ).toContainText('parameter_values.sault_time')
  await expect(response.getByLabel('Value for sault_time')).toHaveValue('')
  await expect(
    request.getByLabel('Value for forward_soberness_check')
  ).toHaveValue('')
  await expect(request.getByLabel('Value for num_flips')).toHaveValue('')
  await dialog.getByRole('button', { name: 'Apply values' }).click()
  await expect(response.getByLabel('Value for sault_time')).toHaveValue('42')
  await expect(
    request.getByLabel('Value for forward_soberness_check')
  ).toHaveValue('18')
  await expect(request.getByLabel('Value for num_flips')).toHaveValue('3')

  await responseCodec.getByRole('button', { name: 'Encode message' }).click()
  await expect(responseCodec.getByTestId('message-codec-hex')).toHaveText(
    'FA 03 2A',
    { timeout: 10000 }
  )

  let download = page.waitForEvent('download')

  await responseCodec
    .getByRole('button', { name: 'Download values', exact: true })
    .click()
  expect(await downloadedValues(await download)).toEqual({
    parameter_values: { sault_time: 42 },
    request_parameter_values: { forward_soberness_check: 18, num_flips: 3 },
  })
  download = page.waitForEvent('download')
  await expect(
    responseCodec.getByRole('button', { name: 'Download decoded values' })
  ).toHaveAccessibleDescription(/constants and derived parameters.*excluded/)
  await responseCodec
    .getByRole('button', { name: 'Download decoded values' })
    .click()
  const decoded = await downloadedValues(await download)

  expect(decoded.document_kind).toBe('decoded-output')
  expect(decoded.parameter_values).toMatchObject({
    num_flips_done: 3,
    sault_time: 42,
  })
  await responseCodec.getByLabel('Upload parameter JSON file').setInputFiles({
    name: 'decoded.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(decoded)),
  })
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(
    dialog.getByRole('list', { name: 'Import warnings' })
  ).toContainText('num_flips_done')
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Apply values' }).click()

  await responseCodec
    .getByRole('button', { name: 'Edit JSON', exact: true })
    .click()
  await dialog.getByLabel('Parameter values JSON').fill(
    JSON.stringify({
      parameter_values: { sault_time: 99 },
      request_parameter_values: { num_flips: 'invalid' },
    })
  )
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(dialog.getByRole('alert')).toContainText(
    'request_parameter_values.num_flips'
  )
  await expect(
    dialog.getByRole('button', { name: 'Apply values' })
  ).toBeDisabled()
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(response.getByLabel('Value for sault_time')).toHaveValue('42')
  await expect(request.getByLabel('Value for num_flips')).toHaveValue('3')
})

test('JSON request documents validate, merge and replace values', async ({
  page,
}) => {
  test.slow()
  await page.goto(
    '/diagnostic-comm?objectId=cdf68a3c9e6278ed1ded08198ec4376b&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )
  const request = page.getByRole('region', { name: 'Request', exact: true })
  const requestCodec = request.getByRole('region', {
    name: 'Diagnostic message codec',
  })
  const dialog = page.getByRole('dialog', { name: 'Physical parameter values' })

  await requestCodec.getByLabel('Upload parameter JSON file').setInputFiles({
    name: 'request.json',
    mimeType: 'application/json',
    buffer: Buffer.from(
      JSON.stringify({
        parameter_values: { forward_soberness_check: 18, num_flips: 3 },
      })
    ),
  })
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await dialog.getByRole('button', { name: 'Apply values' }).click()
  await expect(
    request.getByLabel('Value for forward_soberness_check')
  ).toHaveValue('18')
  await expect(request.getByLabel('Value for num_flips')).toHaveValue('3')

  await requestCodec
    .getByRole('button', { name: 'Edit JSON', exact: true })
    .click()
  await dialog.getByLabel('Parameter values JSON').fill('invalid JSON')
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(dialog.getByRole('alert')).toBeVisible()
  await expect(
    dialog.getByRole('button', { name: 'Apply values' })
  ).toBeDisabled()
  await dialog
    .getByLabel('Parameter values JSON')
    .fill(JSON.stringify({ parameter_values: { unknown_value: 7 } }))
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(dialog.getByRole('alert')).toContainText(
    'parameter_values.unknown_value'
  )
  await dialog
    .getByLabel('Parameter values JSON')
    .fill(JSON.stringify({ parameter_values: { num_flips: 4 } }))
  await dialog.getByRole('button', { name: 'Merge', exact: true }).click()
  await dialog.getByRole('button', { name: 'Preview changes' }).click()

  await dialog.getByRole('button', { name: 'Apply values' }).click()
  await expect(
    request.getByLabel('Value for forward_soberness_check')
  ).toHaveValue('18')
  await expect(request.getByLabel('Value for num_flips')).toHaveValue('4')

  await requestCodec
    .getByRole('button', { name: 'Edit JSON', exact: true })
    .click()
  await dialog
    .getByLabel('Parameter values JSON')
    .fill(JSON.stringify({ parameter_values: { num_flips: 2 } }))
  await dialog.getByRole('button', { name: 'Replace', exact: true }).click()
  await dialog.getByRole('button', { name: 'Preview changes' }).click()

  await dialog.getByRole('button', { name: 'Apply values' }).click()
  await expect(
    request.getByLabel('Value for forward_soberness_check')
  ).toHaveValue('')
  await expect(request.getByLabel('Value for num_flips')).toHaveValue('2')
})

test('JSON request template download, import and encode', async ({ page }) => {
  test.slow()
  await page.goto(
    '/diagnostic-comm?objectId=cdf68a3c9e6278ed1ded08198ec4376b&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )
  const requestCodec = page
    .getByRole('region', { name: 'Request', exact: true })
    .getByRole('region', { name: 'Diagnostic message codec' })
  const dialog = page.getByRole('dialog', { name: 'Physical parameter values' })

  const download = page.waitForEvent('download')

  await requestCodec.getByRole('button', { name: 'Download template' }).click()
  const template = await downloadedValues(await download)

  expect(template.parameter_values).toMatchObject({
    forward_soberness_check: null,
    num_flips: null,
  })
  expect(template.required_parameters).toContain(
    'parameter_values.forward_soberness_check'
  )
  expect(
    template.parameter_guidance?.['parameter_values.num_flips']
  ).toMatchObject({
    json_type: 'integer',
    minimum: 0,
    maximum: 255,
    step: 1,
    required: true,
  })
  const filledTemplate = structuredClone(template)

  for (const name of ['forward_soberness_check', 'num_flips']) {
    const example =
      template.parameter_guidance?.[`parameter_values.${name}`]?.examples?.[0]

    expect(typeof example).toBe('number')
    filledTemplate.parameter_values[name] = example
  }
  await requestCodec.getByLabel('Upload parameter JSON file').setInputFiles({
    name: 'guided-template.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(filledTemplate)),
  })
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(dialog.getByRole('alert')).toHaveCount(0)
  await dialog.getByRole('button', { name: 'Apply values' }).click()

  await requestCodec.getByRole('button', { name: 'Encode message' }).click()
  await expect(requestCodec.getByTestId('message-codec-hex')).toHaveText(
    /^BA [0-9A-F]{2} [0-9A-F]{2}$/,
    { timeout: 10000 }
  )
})

test('JSON file import fills nested physical values and validates full paths', async ({
  page,
}) => {
  test.slow()
  await page.goto(
    '/diagnostic-comm?objectId=5b4d00a8d1ba6f53b3a47231600cb2f6&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )
  const requestCodec = page
    .getByRole('region', { name: 'Request', exact: true })
    .getByRole('region', { name: 'Diagnostic message codec' })
  const response = page.getByRole('region', {
    name: 'Positive Responses',
    exact: true,
  })
  const codec = response.getByRole('region', {
    name: 'Diagnostic message codec',
  })
  const dialog = page.getByRole('dialog', { name: 'Physical parameter values' })

  await requestCodec.getByRole('tab', { name: 'Decode' }).click()

  await requestCodec.getByLabel('Hex message to decode').fill('19 02 00')
  await requestCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(requestCodec.getByTestId('decoded-values-summary')).toBeVisible({
    timeout: 10000,
  })

  const document = {
    parameter_values: {
      TestFailed: 'false',
      ConfirmedDTC: 'false',
      TestNotCompletedSinceLastClear: 'false',
      TestFailedSinceLastClear: 'false',
      DTCAndStatusRecord: [
        {
          DTCRecord: 4097,
          TestFailed: 'true',
          ConfirmedDTC: 'true',
          TestNotCompletedSinceLastClear: 'false',
          TestFailedSinceLastClear: 'true',
        },
      ],
    },
  }

  await codec.getByLabel('Upload parameter JSON file').setInputFiles({
    name: 'records.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(document)),
  })
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(dialog.getByRole('alert')).toHaveCount(0)

  await dialog.getByRole('button', { name: 'Apply values' }).click()
  await expect(
    response.getByRole('combobox', { name: 'DTC for dtc_dop_all' })
  ).toHaveValue('4097', { timeout: 10000 })

  await codec.getByRole('button', { name: 'Encode message' }).click()
  await expect(codec.getByTestId('message-codec-hex')).toHaveText(
    '59 02 00 00 10 01 29',
    { timeout: 10000 }
  )

  await codec.getByRole('button', { name: 'Edit JSON', exact: true }).click()
  await dialog.getByLabel('Parameter values JSON').fill(
    JSON.stringify({
      parameter_values: { DTCAndStatusRecord: [{ DTCRecord: 'wrong' }] },
    })
  )
  await dialog.getByRole('button', { name: 'Preview changes' }).click()
  await expect(dialog.getByRole('alert')).toContainText(
    'parameter_values.DTCAndStatusRecord[0].DTCRecord'
  )
  await expect(
    dialog.getByRole('button', { name: 'Apply values' })
  ).toBeDisabled()
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click()
  const download = page.waitForEvent('download')

  await codec.getByRole('button', { name: 'Download template' }).click()
  const template = await downloadedValues(await download)

  expect(template.parameter_values).toMatchObject({
    DTCAndStatusRecord: [{ DTCRecord: null }],
  })
  expect(
    template.parameter_guidance?.['parameter_values.DTCAndStatusRecord']
  ).toMatchObject({ json_type: 'array', min_items: 0 })
  expect(
    template.parameter_guidance?.[
      'parameter_values.DTCAndStatusRecord[0].DTCRecord'
    ]
  ).toMatchObject({
    json_type: 'integer',
    examples: [4097],
    known_values: expect.arrayContaining([
      expect.objectContaining({ value: 4097, display_code: 'P1001' }),
    ]),
  })
  expect(
    template.parameter_guidance?.[
      'parameter_values.DTCAndStatusRecord[0].TestFailed'
    ]
  ).toMatchObject({
    json_type: 'string',
    allowed_values: expect.arrayContaining(['true', 'false']),
  })
  expect(
    template.parameter_guidance?.['request_parameter_values.TestFailed']
  ).toMatchObject({
    json_type: 'string',
    allowed_values: expect.arrayContaining(['true', 'false']),
  })
})

test('encode and decode request and response parameter values', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-comm?objectId=cdf68a3c9e6278ed1ded08198ec4376b&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )
  await expect(page.locator('[data-hydrated]')).toHaveAttribute(
    'data-hydrated',
    'true'
  )

  await expect(page.getByTestId('diag-comm-container-name')).toHaveText(
    'do_forward_flips',
    { timeout: 10000 }
  )

  const requestSection = page.getByRole('region', {
    name: 'Request',
    exact: true,
  })
  const fillNumber = async (input: Locator, value: string) => {
    await input.clear()
    await input.fill(value)
    await expect(input).toHaveValue(value)
  }

  await expect(
    requestSection.getByText('Encoding/Decoding', { exact: true })
  ).toBeVisible()

  await fillNumber(
    requestSection.getByLabel('Value for forward_soberness_check'),
    '18'
  )
  await fillNumber(requestSection.getByLabel('Value for num_flips'), '3')

  const requestCodec = requestSection.getByRole('region', {
    name: 'Diagnostic message codec',
  })

  await expect(requestCodec.getByLabel('Hex message to decode')).toHaveCount(0)
  await expect(
    requestCodec.getByText('Source: values entered in this parameter table.', {
      exact: true,
    })
  ).toBeVisible()
  await requestCodec.getByRole('tab', { name: 'Encode' }).click()

  await requestCodec.getByRole('button', { name: 'Encode message' }).click()
  await expect(requestCodec.getByTestId('message-codec-hex')).toHaveText(
    'BA 12 03',
    { timeout: 10000 }
  )

  const requestLayout = requestCodec.getByTestId('message-layout')

  await expect(requestLayout.getByTestId('message-layout-byte')).toHaveCount(3)
  await expect(requestLayout.getByTestId('message-layout-bit')).toHaveCount(24)
  await expect(
    requestLayout.locator('[data-byte="1"][data-bit="7"]')
  ).toHaveAttribute('data-parameter', 'forward_soberness_check')

  const parameterLegend = requestLayout.getByRole('list', {
    name: 'Message parameter legend',
  })
  const sobrietyLegend = parameterLegend.getByRole('button', {
    name: /^forward_soberness_check /,
  })

  await sobrietyLegend.click()
  await expect(sobrietyLegend).toHaveAttribute('aria-pressed', 'true')
  await expect(
    requestLayout.locator('[data-byte="0"][data-bit="7"]')
  ).toHaveCSS('opacity', '0.3')
  await sobrietyLegend.click()

  await requestCodec.getByRole('tab', { name: 'Decode' }).click()
  await expect(requestCodec.getByLabel('Hex message to decode')).toHaveValue(
    'BA 12 03'
  )

  await fillNumber(
    requestSection.getByLabel('Value for forward_soberness_check'),
    '7'
  )
  await fillNumber(requestSection.getByLabel('Value for num_flips'), '4')
  await requestCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(
    requestCodec.getByTestId('decoded-values-summary')
  ).toContainText('Updated 2 editable parameter values', { timeout: 10000 })

  await expect(
    requestCodec.getByTestId('message-codec-physical-values')
  ).toContainText('"forward_soberness_check": 18')
  await expect(
    requestSection.getByLabel('Value for forward_soberness_check')
  ).toHaveValue('18')
  await expect(requestSection.getByLabel('Value for num_flips')).toHaveValue(
    '3'
  )
  await expect(requestLayout.getByTestId('message-layout-byte')).toHaveCount(3)

  const responseSection = page.getByRole('region', {
    name: 'Positive Responses',
    exact: true,
  })

  await fillNumber(responseSection.getByLabel('Value for sault_time'), '42')

  const responseCodec = responseSection.getByRole('region', {
    name: 'Diagnostic message codec',
  })

  await expect(responseCodec).toContainText(
    'Triggering request: do_forward_flips · uses values from the Request table.'
  )

  await responseCodec.getByRole('button', { name: 'Encode message' }).click()
  await expect(responseCodec.getByTestId('message-codec-hex')).toHaveText(
    'FA 03 2A',
    { timeout: 10000 }
  )

  await responseCodec.getByRole('tab', { name: 'Decode' }).click()
  await expect(responseCodec.getByLabel('Hex message to decode')).toHaveValue(
    'FA 03 2A'
  )

  await fillNumber(responseSection.getByLabel('Value for sault_time'), '5')
  await responseCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(
    responseCodec.getByTestId('decoded-values-summary')
  ).toContainText('Updated 1 editable parameter value', { timeout: 10000 })

  await expect(
    responseCodec.getByTestId('message-codec-physical-values')
  ).toContainText('"sault_time": 42')
  await expect(responseSection.getByLabel('Value for sault_time')).toHaveValue(
    '42'
  )
})

test('re-encode decoded repeated response values', async ({ page }) => {
  test.slow()

  await page.goto(
    '/diagnostic-comm?objectId=5b4d00a8d1ba6f53b3a47231600cb2f6&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  const requestSection = page.getByRole('region', {
    name: 'Request',
    exact: true,
  })
  const requestCodec = requestSection.getByRole('region', {
    name: 'Diagnostic message codec',
  })

  await requestCodec.getByRole('tab', { name: 'Decode' }).click()
  await expect(requestCodec.getByLabel('Hex message to decode')).toBeVisible()

  await requestCodec.getByLabel('Hex message to decode').fill('19 02 00')
  await requestCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(requestCodec.getByTestId('decoded-values-summary')).toBeVisible({
    timeout: 10000,
  })
  await expect(requestCodec.getByRole('alert')).toHaveCount(0)
  await expect(
    requestSection.getByLabel('Value for TestFailed', { exact: true })
  ).toBeVisible()

  const requestLayout = requestCodec.getByTestId('message-layout')

  await expect(
    requestLayout.locator('[data-byte="2"][data-bit="0"]')
  ).toHaveAttribute('data-parameter', 'TestFailed')
  await expect(
    requestLayout.locator('[data-byte="2"][data-bit="7"]')
  ).toHaveAttribute('data-parameter', 'WarningIndicatorRequested')
  await expect(
    requestLayout
      .locator('[data-layout-path="TestFailed"]')
      .getByText('byte 2, bit 0', { exact: true })
  ).toBeVisible()
  await expect(requestLayout).not.toContainText(
    'byte 2, bit 0 to byte 2, bit 0'
  )

  const responseSection = page.getByRole('region', {
    name: 'Positive Responses',
    exact: true,
  })
  const responseCodec = responseSection.getByRole('region', {
    name: 'Diagnostic message codec',
  })
  const hexMessage = '59 02 00 00 10 01 29 00 10 02 08'

  await responseCodec.getByRole('tab', { name: 'Decode' }).click()

  await expect(responseCodec.getByLabel('Hex message to decode')).toBeVisible()
  await responseCodec.getByLabel('Hex message to decode').fill(hexMessage)

  await responseCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(
    responseCodec.getByTestId('decoded-values-summary')
  ).toContainText('Updated 14 editable parameter values', { timeout: 10000 })

  await responseCodec.getByRole('tab', { name: 'Encode' }).click()
  await expect(
    responseCodec.getByRole('button', { name: 'Encode message' })
  ).toBeVisible()

  const encoding = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url().endsWith('/encode')
  )

  await responseCodec.getByRole('button', { name: 'Encode message' }).click()
  const payload = (await encoding).postDataJSON()

  expect(payload.parameter_values.DTCAndStatusRecord).toEqual([
    expect.objectContaining({ DTCRecord: 4097 }),
    expect.objectContaining({ DTCRecord: 4098 }),
  ])
  await expect(responseCodec.getByTestId('message-codec-hex')).toHaveText(
    hexMessage
  )
  const layout = responseCodec.getByTestId('message-layout')

  await expect(layout.getByTestId('message-layout-byte')).toHaveCount(11)
  await expect(
    layout.locator('[data-parameter="DTCAndStatusRecord"]')
  ).toHaveCount(64)
  const groupToggle = layout.getByRole('button', {
    name: 'Toggle DTCAndStatusRecord',
    exact: true,
  })

  await expect(groupToggle).toHaveAttribute('aria-expanded', 'false')

  await groupToggle.click()
  await expect(groupToggle).toHaveAttribute('aria-expanded', 'true')

  await expect(
    layout.locator('[data-parameter="DTCAndStatusRecord[0]"]')
  ).toHaveCount(32)
  await expect(
    layout.locator('[data-parameter="DTCAndStatusRecord[1]"]')
  ).toHaveCount(32)
  await layout
    .getByRole('button', { name: 'Toggle DTCAndStatusRecord[0]', exact: true })
    .click()
  await expect(layout.locator('[data-byte="3"][data-bit="7"]')).toHaveAttribute(
    'data-parameter',
    'DTCAndStatusRecord[0].DTCRecord'
  )
  await expect(
    layout.getByRole('list', { name: 'Message parameter legend' })
  ).toContainText('4097')
  await expect(
    layout.locator('[data-parameter="DTCAndStatusRecord[0].DTCRecord"]')
  ).toHaveCount(24)
  await groupToggle.click()
  await expect(
    layout.locator('[data-parameter="DTCAndStatusRecord"]')
  ).toHaveCount(64)
  await layout
    .getByRole('button', { name: 'Expand all parameter groups' })
    .click()
  await expect(
    layout.locator('[data-parameter="DTCAndStatusRecord[0].DTCRecord"]')
  ).toHaveCount(24)
  await expect(
    layout.locator('[data-parameter="DTCAndStatusRecord[1].DTCRecord"]')
  ).toHaveCount(24)
  await layout
    .getByRole('list', { name: 'Message parameter legend' })
    .getByRole('button', { name: /^DTCAndStatusRecord EndOfPduField/ })
    .click()
  await expect(layout.locator('[data-byte="7"][data-bit="7"]')).toHaveCSS(
    'opacity',
    '1'
  )
  await expect(layout.locator('[data-byte="0"][data-bit="7"]')).toHaveCSS(
    'opacity',
    '0.3'
  )
})

test('message layout shows real table rows and selecting keys', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-comm?objectId=84cf50e8cb2eb6e9874671c4b860b665&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )
  const codec = page
    .getByRole('region', { name: 'Positive Responses', exact: true })
    .getByRole('region', { name: 'Diagnostic message codec' })

  await codec.getByRole('tab', { name: 'Decode' }).click()
  await codec.getByLabel('Hex message to decode').fill('62 00 00 03 FA 03 2A')
  await codec.getByRole('button', { name: 'Decode message' }).click()
  const layout = codec.getByTestId('message-layout')

  await expect(
    layout.locator('[data-parameter="last_pos_response"]')
  ).toHaveCount(24)
  await layout
    .getByRole('button', { name: 'Toggle last_pos_response', exact: true })
    .click()
  await expect(
    layout.locator('[data-parameter="last_pos_response.forward_grudging"]')
  ).toHaveCount(24)
  await expect(
    layout.getByText('Selected by last_pos_response_key', { exact: true })
  ).toBeVisible()
  await layout
    .getByRole('button', {
      name: 'Toggle last_pos_response.forward_grudging',
      exact: true,
    })
    .click()
  await expect(
    layout.locator(
      '[data-parameter="last_pos_response.forward_grudging.sault_time"]'
    )
  ).toHaveCount(8)
  await layout
    .getByRole('list', { name: 'Message parameter legend' })
    .getByRole('button', { name: /^last_pos_response TableStructParameter/ })
    .click()
  await expect(layout.locator('[data-byte="6"][data-bit="7"]')).toHaveCSS(
    'opacity',
    '1'
  )
  await expect(layout.locator('[data-byte="0"][data-bit="7"]')).toHaveCSS(
    'opacity',
    '0.3'
  )

  await layout
    .getByRole('button', { name: 'Collapse all parameter groups' })
    .click()
  await expect(
    layout.locator('[data-parameter="last_pos_response"]')
  ).toHaveCount(24)
  await expect(
    layout.getByRole('button', {
      name: 'Toggle last_pos_response.forward_grudging',
      exact: true,
    })
  ).toHaveCount(0)
  await layout
    .getByRole('button', { name: 'Expand all parameter groups' })
    .click()
  await expect(
    layout.locator(
      '[data-parameter="last_pos_response.forward_grudging.sault_time"]'
    )
  ).toHaveCount(8)
})

test('large message layout keeps bytes and legend visible together', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-comm?objectId=5b4d00a8d1ba6f53b3a47231600cb2f6&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )
  const codec = page
    .getByRole('region', { name: 'Positive Responses', exact: true })
    .getByRole('region', { name: 'Diagnostic message codec' })

  await codec.getByRole('tab', { name: 'Decode' }).click()
  await codec
    .getByLabel('Hex message to decode')
    .fill(
      `59 02 00 ${Array.from({ length: 12 }, () => '00 10 01 29').join(' ')}`
    )
  await codec.getByRole('button', { name: 'Decode message' }).click()
  const layout = codec.getByTestId('message-layout')

  await expect(layout.getByTestId('message-layout-byte')).toHaveCount(51)
  await layout
    .getByRole('button', { name: 'Expand all parameter groups' })
    .click()
  const diagram = layout.getByTestId('message-layout-diagram')
  const bytes = layout.getByTestId('message-layout-byte-pane')
  const legend = layout.getByTestId('message-layout-legend-pane')
  const details = layout.getByRole('region', { name: 'Parameter details' })

  await layout.scrollIntoViewIfNeeded()
  await expect
    .poll(async () => {
      const diagramBounds = await diagram.boundingBox()
      const legendBounds = await legend.boundingBox()

      return (
        diagramBounds !== null &&
        legendBounds !== null &&
        diagramBounds.x + diagramBounds.width <= legendBounds.x
      )
    })
    .toBe(true)
  const diagramBounds = await diagram.boundingBox()
  const diagramScroll = await bytes.evaluate((element) => element.scrollTop)

  await legend.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  expect(await legend.evaluate((element) => element.scrollTop)).toBeGreaterThan(
    0
  )
  expect(await bytes.evaluate((element) => element.scrollTop)).toBe(
    diagramScroll
  )
  await expect
    .poll(async () => (await diagram.boundingBox())?.y)
    .toBeCloseTo(diagramBounds!.y, 0)

  const lastPath = 'DTCAndStatusRecord[11].WarningIndicatorRequested'
  const lastBit = bytes.locator('[data-byte="50"][data-bit="7"]')

  await legend.evaluate((element) => {
    element.scrollTop = 0
  })
  await lastBit.click()
  await expect(details).toContainText(lastPath)
  const selectedEntry = legend
    .locator(`[data-layout-path="${lastPath}"]`)
    .getByRole('button')

  await expect(selectedEntry).toHaveAttribute('aria-pressed', 'true')
  await expect
    .poll(async () => {
      const selectedBounds = await selectedEntry.boundingBox()
      const scrolledLegendBounds = await legend.boundingBox()

      return (
        selectedBounds !== null &&
        scrolledLegendBounds !== null &&
        selectedBounds.y >= scrolledLegendBounds.y - 1 &&
        selectedBounds.y + selectedBounds.height <=
          scrolledLegendBounds.y + scrolledLegendBounds.height + 1
      )
    })
    .toBe(true)

  const sidEntry = legend
    .locator('[data-layout-path="SID_PR"]')
    .getByRole('button')

  await sidEntry.click()
  await expect(details).toContainText('SID_PR')
  await expect
    .poll(() => bytes.evaluate((element) => element.scrollTop))
    .toBe(0)
  await bytes.locator('[data-byte="3"][data-bit="7"]').hover()
  await expect(
    legend
      .locator('[data-layout-path="DTCAndStatusRecord[0].DTCRecord"]')
      .getByRole('button')
  ).toHaveAttribute('data-active', 'true')
  await expect(details).toContainText('DTCAndStatusRecord[0].DTCRecord')
  await page.mouse.move(0, 0)
  await expect(details).toContainText('SID_PR')
})
