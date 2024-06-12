import { InvalidParamError, MissingParamError, ServerError } from '../errors'
import { EmailValidation } from '../protocols/email-validation'
import { SignUpController } from './signup'

const makeEmailValidationStub = (): EmailValidation => {
  class EmailValidationStub {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidationStub()
}

const makeEmailValidationStubWithError = (): EmailValidation => {
  class EmailValidationStub {
    isValid (email: string): boolean {
      throw new Error()
    }
  }
  return new EmailValidationStub()
}

interface SutTypes {
  sut: SignUpController
  emailValidationStub: EmailValidation
}

const makeSut = (): SutTypes => {
  const emailValidationStub = makeEmailValidationStub()
  const sut = new SignUpController(emailValidationStub)
  return {
    sut,
    emailValidationStub
  }
}

describe('SignUp Controller', () => {
  test('should return 400 if no name is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@test.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('name'))
  })
  test('should return 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })
  test('should return 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@test.com',
        name: 'any_name',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })
  test('should return 400 if no passwordConfirmation is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'any_email@test.com',
        name: 'any_name',
        password: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(
      new MissingParamError('passwordConfirmation')
    )
  })
  test('should return 400 if email is invalid', () => {
    const { sut, emailValidationStub } = makeSut()
    jest.spyOn(emailValidationStub, 'isValid').mockReturnValueOnce(false)
    const httpRequest = {
      body: {
        email: 'any_email@test.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(
      new InvalidParamError('email')
    )
  })
  test('should call EmailValidation with correct parameter', () => {
    const { sut, emailValidationStub } = makeSut()
    const isValidSpy = jest.spyOn(emailValidationStub, 'isValid')
    const httpRequest = {
      body: {
        email: 'any_email@test.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    sut.handle(httpRequest)
    expect(isValidSpy).toHaveBeenCalledWith('any_email@test.com')
  })
  test('should return 500 if EmailValidation throws', () => {
    const emailValidationStub = makeEmailValidationStubWithError()
    const sut = new SignUpController(emailValidationStub)
    const httpRequest = {
      body: {
        email: 'any_email@test.com',
        name: 'any_name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
})
