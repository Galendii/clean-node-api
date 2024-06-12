import { AccountModel } from '../models'

export interface AddAccountModel {
  email: string
  password: string
  name: string
}

export interface AddAccount {
  add: (account: AddAccountModel) => AccountModel
}
