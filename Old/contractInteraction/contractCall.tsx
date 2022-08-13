import { makeStyles } from "@material-ui/core/styles";
import { useMemo } from "react";
import ContractABI from "./ContractABI";
import { EthAddressInput } from "./EthAddressInput";
import GnoForm from "./GnoForm";
import { MethodsDropdown } from "./MethodsDropdown";
import { RenderInputParams } from "./RenderInputParams";
import {
  createTxObject,
  formMutators,
  handleSubmitError,
  isReadMethod,
} from "./utils";

const useStyles = makeStyles(styles);

export interface CreatedTx {
  contractAddress: string;
  data: string;
  selectedMethod: TransactionReviewType;
  value: string | number;
}

export type ContractInteractionTx = {
  contractAddress?: string;
};

export interface ContractInteractionProps {
  contractAddress?: string;
  initialValues: ContractInteractionTx;
  isABI: boolean;
  onClose: () => void;
  switchMethod: () => void;
  onNext: (tx: CreatedTx, submit: boolean) => void;
}

const ContractInteraction: React.FC<ContractInteractionProps> = ({
  contractAddress,
  initialValues,
  isABI,
  onClose,
  onNext,
  switchMethod,
}) => {
  const classes = useStyles();

  let setCallResults: any;

  useMemo(() => {
    if (contractAddress) {
      initialValues.contractAddress = contractAddress;
    }
  }, [contractAddress, initialValues]);

  const saveForm = async (values: CreatedTx): Promise<void> => {
    await handleSubmit(values, false);
    switchMethod();
  };

  const handleSubmit = async (
    { contractAddress, selectedMethod, value, ...values },
    submit = true
  ): Promise<void | Record<string, string>> => {
    if (value || (contractAddress && selectedMethod)) {
      try {
        const txObject = createTxObject(
          selectedMethod,
          contractAddress,
          values
        );
        const data = txObject.encodeABI();

        if (isReadMethod(selectedMethod) && submit) {
          const result = await txObject.call({ from: safeAddress });
          setCallResults(result);

          // this was a read method, so we won't go to the 'review' screen
          return;
        }

        onNext(
          { ...values, contractAddress, data, selectedMethod, value },
          submit
        );
      } catch (error) {
        return handleSubmitError(error, values);
      }
    }
  };

  return (
    <>
      <GnoForm
        //decorators={[ensResolver]}
        formMutators={formMutators}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        // subscription={{ submitting: true, pristine: true, values: true }}
      >
        {(mutators: any) => {
          setCallResults = mutators.setCallResults;
          return (
            <>
              <EthAddressInput
                name="contractAddress"
                onScannedValue={mutators.setContractAddress}
                text="Contract address*"
              />
              <ContractABI />
              <MethodsDropdown onChange={mutators.setSelectedMethod} />
              <RenderInputParams />
            </>
          );
        }}
      </GnoForm>
    </>
  );
};

export default ContractInteraction;
