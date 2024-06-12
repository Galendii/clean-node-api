import { InvalidParamError } from '../errors/invalid-param-error'
import { MissingParamError } from '../errors/missing-param-error'
import { ServerError } from '../errors/server-error'
import { badRequest } from '../helpers/http-helper'
import { Controller } from '../protocols/controller'
import { EmailValidation } from '../protocols/email-validation'
import { HttpRequest, HttpResponse } from '../protocols/http'

export class SignUpController implements Controller {
  constructor (
    private readonly emailValidation: EmailValidation
  ) {

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
      if (!this.emailValidation.isValid(`${httpRequest.body.email}`)) {
        return badRequest(new InvalidParamError('email'))
      }

      return { statusCode: 200 }
    } catch (error) {
      return {
        statusCode: 500,
        body: new ServerError()
      }
    }
  }
}
