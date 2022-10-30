import {
  useValidateAssetsAmount,
  useValidateCA,
  useValidateHF,
  useValidateStrategy,
  ValidateCAProps,
} from "./useValidators";
import {
  ValidateBalancesProps,
  ValidateHFProps,
  ValidateStrategyOpenPathProps,
} from "./validators";

type ValidateOpenAccountProps = ValidateCAProps &
  ValidateBalancesProps &
  ValidateHFProps;

export function useValidateOpenAccount({
  balances,
  assets,
  tokensList,

  cm,
  amount,
  debt,

  hf,
}: ValidateOpenAccountProps) {
  const caErrorString = useValidateCA({
    tokensList,
    cm,
    amount,
    debt,
  });

  const assetsAmountErrorString = useValidateAssetsAmount({
    balances,
    assets,
    tokensList,
  });

  const hfErrorString = useValidateHF({
    hf,
  });

  return assetsAmountErrorString || caErrorString || hfErrorString;
}

type ValidateOpenStrategyProps = ValidateOpenAccountProps &
  ValidateStrategyOpenPathProps &
  ValidateHFProps;

export function useValidateOpenStrategy({
  balances,
  assets,
  tokensList,

  cm,
  amount,
  debt,

  strategyPath,

  hf,
}: ValidateOpenStrategyProps) {
  const caErrorString = useValidateCA({
    tokensList,
    cm,
    amount,
    debt,
  });

  const assetsAmountErrorString = useValidateAssetsAmount({
    balances,
    assets,
    tokensList,
  });

  const openStrategyErrorString = useValidateStrategy({
    strategyPath,
  });

  const hfErrorString = useValidateHF({
    hf,
  });

  return (
    assetsAmountErrorString ||
    caErrorString ||
    openStrategyErrorString ||
    hfErrorString
  );
}
