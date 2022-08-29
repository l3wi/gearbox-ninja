/**
 * Operations redux library
 * Copyright 2020 Mikael Lazarev
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { OperationState } from './reducer'
export { updateStatus } from './actions'
export { operationReducer } from './reducer'

export interface Operation {
  id: string
  status: STATUS
  error?: string
  options?: unknown
}

export type OperationTypes =
  | 'OPERATION_REQUEST'
  | 'OPERATION_SUCCESS'
  | 'OPERATION_FAILURE'

export type OperationActions = {
  type: OperationTypes
  payload: Operation
}

export type OperationRootState = {
  operations: OperationState
}

export function operationSelector(hash: string) {
  return (state: OperationRootState) => state.operations[hash]
}

export type STATUS =
  | 'STATUS.WAITING'
  | 'STATUS.LOADING'
  | 'STATUS.UPDATING'
  | 'STATUS.SUCCESS'
  | 'STATUS.FAILURE'

export interface ErrorWeb3 {
  code?: number
  data?: {
    code?: number
    message?: string
  }
  message?: string
}

export function getError(e: ErrorWeb3): string {
  return e?.data?.message || e?.message || e.toString() || 'Unknown error'
}
