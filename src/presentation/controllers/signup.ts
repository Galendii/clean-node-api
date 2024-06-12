import { AddAccount } from '../domain/usecases/add-account'
import { InvalidParamError } from '../errors/invalid-param-error'
import { MissingParamError } from '../errors/missing-param-error'
import { badRequest, serverError } from '../helpers/http-helper'
import { Controller } from '../protocols/controller'
import { EmailValidation } from '../protocols/email-validation'
import { HttpRequest, HttpResponse } from '../protocols/http'

export class SignUpController implements Controller {
  private readonly emailValidation: EmailValidation
  private readonly addAccount: AddAccount
  constructor (
    emailValidation: EmailValidation, addAccount: AddAccount
  ) {
    this.emailValidation = emailValidation
    this.addAccount = addAccount
  }

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      if (!httpRequest.body.name) {
        return badRequest(new MissingParamError('name'))
      }

      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']

      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingParamError(field))
        }
      }

      const { email, password, passwordConfirmation, name } = httpRequest.body

      if (password !== passwordConfirmation) {
        return badRequest(new InvalidParamError('passwordConfirmation'))
      }

      if (!this.emailValidation.isValid(`${email}`)) {
        return badRequest(new InvalidParamError('email'))
      }

      this.addAccount.add({
        email, password, name
      })

      return { statusCode: 200 }
    } catch (error) {
      return serverError()
    }
  }
}
