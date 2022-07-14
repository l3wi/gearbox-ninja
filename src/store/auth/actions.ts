import { AuthThunkAction } from './index'
import { state } from 'melonjs'

export const signDeclaration =
  (): AuthThunkAction => async (dispatch, getState) => {
    try {
      dispatch({ type: 'PENDING_SIGNATURE' })
      state.pause()
      const { account, signer } = getState().web3
      if (!account || !signer) throw new Error('No account selected')

      const agreement =
        'I hereby further represent and warrant that:\n' +
        '- I’m not a resident of or located in the United States of America (including its territories: American Samoa, Guam, Puerto Rico, the Northern Mariana Islands and the U.S. Virgin Islands) or any other Restricted Jurisdiction (as defined in the Terms of Service).\n' +
        '- I’m not a Prohibited Person (as defined in the Terms of Service) nor acting on behalf of a Prohibited Person.\n' +
        '- I understand that if I fail to maintain sufficient collateral when using the Gearbox Protocol, my credit account(s) may be liquidated, in which case a penalty may be charged by the protocol.\n' +
        '- I acknowledge that Gearbox App and related software are experimental, and that the use of experimental software may result in complete loss of my funds.'

      // @ts-ignore
      const signature = await signer.signMessage(agreement)

      dispatch({
        type: 'SIGN_MESSAGE',
        payload: { notIllegal: true }
      })
      state.pause()
    } catch (e: any) {
      dispatch({
        type: 'SIGN_MESSAGE',
        payload: { notIllegal: false }
      })
      alert('Cant signup: ' + e)
      state.pause()
    }
  }
