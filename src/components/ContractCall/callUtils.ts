// import { AbiItemExtended } from './AbiUtils'

export const NO_CONTRACT = "no contract";

// export const isAddress = (type: string): boolean => type.indexOf('address') === 0
// export const isBoolean = (type: string): boolean => type.indexOf('bool') === 0
// export const isString = (type: string): boolean => type.indexOf('string') === 0
// export const isUint = (type: string): boolean => type.indexOf('uint') === 0
// export const isInt = (type: string): boolean => type.indexOf('int') === 0
// export const isByte = (type: string): boolean => type.indexOf('byte') === 0

// export const isArrayParameter = (parameter: string): boolean => /(\[\d*])+$/.test(parameter)
// export const getParsedJSONOrArrayFromString = (parameter: string): (string | number)[] | null => {
//   try {
//     const arrayResult = JSON.parse(parameter)
//     return arrayResult.map((value) => {
//       if (Number.isInteger(value)) {
//         return new BigNumber(value).toString()
//       }
//       return value
//     })
//   } catch (err) {
//     return null
//   }
// }

// export const generateFormFieldKey = (type: string, signatureHash: string, index: number): string => {
//   const keyType = isArrayParameter(type) ? 'arrayParam' : type
//   return `methodInput-${signatureHash}_${index}_${keyType}`
// }

// const extractMethodArgs =
//   (signatureHash: string, values: Record<string, string>) =>
//   ({ type }, index) => {
//     const key = generateFormFieldKey(type, signatureHash, index)

//     return getParsedJSONOrArrayFromString(values[key]) || values[key]
//   }

// export const createTxObject = (
//   method: AbiItemExtended,
//   contractAddress: string,
//   values: Record<string, string>,
// ): ContractSendMethod => {
//   const web3 = getWeb3()
//   const contract = new web3.eth.Contract([method], contractAddress)
//   const { inputs, name = '', signatureHash } = method
//   const args = inputs?.map(extractMethodArgs(signatureHash, values)) || []

//   return contract.methods[name](...args)
// }

// export const isReadMethod = (method: AbiItemExtended): boolean => method && method.action === 'read'

// export const getValueFromTxInputs = (key: string, type: string, tx: TransactionReviewType): string => {
//   if (isArrayParameter(type)) {
//     key = key.replace('[]', '')
//   }

//   let value = tx[key]

//   if (type === 'bool') {
//     value = String(value)
//   }

//   return value
// }