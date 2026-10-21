// SPDX-License-Identifier: AGPL-3.0-only
import { expect, test } from '@playwright/test'

test('encode and decode request and response parameter values', async ({
  page,
}) => {
  await page.goto(
    '/diagnostic-comm?objectId=cdf68a3c9e6278ed1ded08198ec4376b&variantId=7a92ecf9c86b84e9cd57fe92f4b547c7&containerId=c91929c68418ac5db8f9534234e0fc1b'
  )

  await expect(page.getByTestId('diag-comm-container-name')).toHaveText(
    'do_forward_flips'
  )

  const requestSection = page.getByRole('region', {
    name: 'Request',
    exact: true,
  })

  await expect(
    requestSection.getByText('Encoding/Decoding', { exact: true })
  ).toBeVisible()

  await requestSection
    .getByLabel('Value for forward_soberness_check')
    .fill('18')
  await requestSection.getByLabel('Value for num_flips').fill('3')

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
    'BA 12 03'
  )

  await requestCodec.getByRole('tab', { name: 'Decode' }).click()
  await expect(requestCodec.getByLabel('Hex message to decode')).toHaveValue(
    'BA 12 03'
  )

  await requestSection.getByLabel('Value for forward_soberness_check').fill('7')
  await requestSection.getByLabel('Value for num_flips').fill('4')
  await requestCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(
    requestCodec.getByTestId('decoded-values-summary')
  ).toContainText('Updated 2 editable parameter values')
  await expect(
    requestCodec.getByTestId('message-codec-physical-values')
  ).toContainText('"forward_soberness_check": 18')
  await expect(
    requestSection.getByLabel('Value for forward_soberness_check')
  ).toHaveValue('18')
  await expect(requestSection.getByLabel('Value for num_flips')).toHaveValue(
    '3'
  )

  const responseSection = page.getByRole('region', {
    name: 'Positive Responses',
    exact: true,
  })

  await responseSection.getByLabel('Value for sault_time').fill('42')

  const responseCodec = responseSection.getByRole('region', {
    name: 'Diagnostic message codec',
  })

  await expect(responseCodec).toContainText(
    'Triggering request: do_forward_flips · uses values from the Request table.'
  )
  await responseCodec.getByRole('button', { name: 'Encode message' }).click()
  await expect(responseCodec.getByTestId('message-codec-hex')).toHaveText(
    'FA 03 2A'
  )

  await responseCodec.getByRole('tab', { name: 'Decode' }).click()
  await expect(responseCodec.getByLabel('Hex message to decode')).toHaveValue(
    'FA 03 2A'
  )
  await responseSection.getByLabel('Value for sault_time').fill('5')
  await responseCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(
    responseCodec.getByTestId('decoded-values-summary')
  ).toContainText('Updated 1 editable parameter value')
  await expect(
    responseCodec.getByTestId('message-codec-physical-values')
  ).toContainText('"sault_time": 42')
  await expect(responseSection.getByLabel('Value for sault_time')).toHaveValue(
    '42'
  )
})

test('re-encode decoded repeated response values', async ({ page }) => {
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
  await requestCodec.getByLabel('Hex message to decode').fill('19 02 00')
  await requestCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(requestCodec.getByRole('alert')).toHaveCount(0)
  await expect(
    requestSection.getByLabel('Value for TestFailed', { exact: true })
  ).toBeVisible()

  const responseSection = page.getByRole('region', {
    name: 'Positive Responses',
    exact: true,
  })
  const responseCodec = responseSection.getByRole('region', {
    name: 'Diagnostic message codec',
  })
  const hexMessage = '59 02 00 00 10 01 29'

  await responseCodec.getByRole('tab', { name: 'Decode' }).click()
  await responseCodec.getByLabel('Hex message to decode').fill(hexMessage)
  await responseCodec.getByRole('button', { name: 'Decode message' }).click()
  await expect(
    responseCodec.getByTestId('decoded-values-summary')
  ).toContainText('Updated')

  await responseCodec.getByRole('tab', { name: 'Encode' }).click()
  const encoding = page.waitForRequest(
    (request) =>
      request.method() === 'POST' && request.url().endsWith('/encode')
  )

  await responseCodec.getByRole('button', { name: 'Encode message' }).click()
  const payload = (await encoding).postDataJSON()

  expect(payload.parameter_values.DTCAndStatusRecord).toEqual([
    expect.objectContaining({ DTCRecord: 4097 }),
  ])
  await expect(responseCodec.getByTestId('message-codec-hex')).toHaveText(
    hexMessage
  )
})
