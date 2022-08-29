import { OperationActions, OperationTypes, STATUS } from './index'

export const updateStatus: (
  id: string | undefined,
  status: STATUS,
  error?: string,
  options?: unknown
) => OperationActions = (id, status, error, options) => {
  id = id ?? Date.now().toString()

  const statusToType: Record<STATUS, OperationTypes> = {
    'STATUS.WAITING': 'OPERATION_REQUEST',
    'STATUS.LOADING': 'OPERATION_REQUEST',
    'STATUS.UPDATING': 'OPERATION_REQUEST',
    'STATUS.SUCCESS': 'OPERATION_SUCCESS',
    'STATUS.FAILURE': 'OPERATION_FAILURE'
  }

  return {
    type: statusToType[status],
    payload: {
      id,
      status,
      error,
      options
    }
  }
}
