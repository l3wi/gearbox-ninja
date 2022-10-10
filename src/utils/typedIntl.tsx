import type { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat'
import React, { useCallback, useMemo } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { LocaleKeys } from '../locale/en'

declare type FormattedMessageProps = React.ComponentProps<
  typeof FormattedMessage
>
export declare type Values = FormattedMessageProps['values']
export type { LocaleKeys }

export interface FormattedMessageTypedProps {
  id: LocaleKeys
  values?: Values
}
export interface FormatMessageTypedProps {
  id: LocaleKeys
}

export function FormattedMessageTyped({
  id,
  values
}: FormattedMessageTypedProps): React.ReactElement {
  return React.createElement(FormattedMessage, { id: id, values: values })
}
export function useIntlTyped() {
  const intl = useIntl()
  const formatMessage = useCallback(
    (
      { id }: FormatMessageTypedProps,
      values?: Record<
        string,
        PrimitiveType | FormatXMLElementFn<string, string>
      >
    ) => intl.formatMessage({ id }, values),
    [intl]
  )
  const intlTyped = useMemo(
    () => ({ formatMessage, intl }),
    [intl, formatMessage]
  )
  return intlTyped
}
