import httpMocks from 'node-mocks-http';
import * as mockedSession from '../../utils/session';
import { AuthController } from './auth.controller';
import * as AuthServiceModule from './auth.service';

jest.mock('./auth.service', () => {
  const mockLogin = jest.fn();
  const mockVerify2FA = jest.fn();

  return {
    AuthService: jest.fn(() => ({
      login: mockLogin,
      verify2FA: mockVerify2FA,
    })),
    __mock: {
      mockLogin,
      mockVerify2FA,
    },
    __esModule: true,
  };
});
type AuthServiceModuleMock = typeof AuthServiceModule & {
  __mock: {
    mockLogin: jest.Mock;
    mockVerify2FA: jest.Mock;
  };
};
const authServiceModule = jest.requireMock(
  './auth.service'
) as AuthServiceModuleMock;

const { mockLogin, mockVerify2FA } = authServiceModule.__mock;
const getPending2FAUserIdMock = mockedSession.getPending2FAUserId as jest.MockedFunction<
  typeof mockedSession.getPending2FAUserId
>;

jest.mock('../../utils/session', () => ({
  setPending2FACookie: jest.fn(),
  setSessionCookie: jest.fn(),
  clearPending2FACookie: jest.fn(),
  clearSessionCookie: jest.fn(),
  getPending2FAUserId: jest.fn(),
}));

describe('AuthController', () => {
  let controller: InstanceType<typeof AuthController>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLogin.mockReset();
    mockVerify2FA.mockReset();
    controller = new AuthController();
  });

  const createLoginRequest = (email = 'user@email.com') =>
    httpMocks.createRequest({
      body: {
        email,
        password: 'password',
      },
      ip: '1.2.3.4',
      headers: {
        'user-agent': 'jest',
      },
    });

  test('Login define cookie da sessão quando não requer 2FA', async () => {
    mockLogin.mockResolvedValue({
      requires_2fa: false,
      token: 'tok',
      user: { id: 'u1' },
    });

    const req = createLoginRequest('a@b.com');
    const res = httpMocks.createResponse();

    await controller.login(req as any, res as any);
    expect(mockedSession.setSessionCookie).toHaveBeenCalledWith(res, 'tok');
    expect(mockedSession.clearPending2FACookie).toHaveBeenCalledWith(res);
    expect(res._getJSONData()).toEqual({
      requires_2fa: false,
      user: { id: 'u1' },
    });
  });

  test('Login define cookie pendente quando 2FA é necessário', async () => {
    mockLogin.mockResolvedValue({
      requires_2fa: true,
      user: { id: 'u2' },
    });

    const req = createLoginRequest();
    const res = httpMocks.createResponse();

    await controller.login(req as any, res as any);

    expect(mockedSession.setPending2FACookie).toHaveBeenCalledWith(res, 'u2');

    expect(res._getJSONData()).toEqual({
      requires_2fa: true,
      user: { id: 'u2' },
    });
  });

  test('Função de verificar 2FA retorna 401 quando token é incorreto', async () => {
    getPending2FAUserIdMock.mockReturnValue(null);

    const req = httpMocks.createRequest({
      body: { token: '123' },
    });

    const res = httpMocks.createResponse();

    await controller.verify2FA(req as any, res as any);

    expect(res.statusCode).toBe(401);
  });

  test('Função de verificar 2FA define cookie da sessão quando token é válido', async () => {
    getPending2FAUserIdMock.mockReturnValue('u9');
    mockVerify2FA.mockResolvedValue({
      token: 't9',
      user: { id: 'u9' },
    });
    const req = httpMocks.createRequest({
      body: { token: '000' },
    });
    const res = httpMocks.createResponse();

    await controller.verify2FA(req as any, res as any);

    expect(mockedSession.setSessionCookie).toHaveBeenCalledWith(res, 't9');

    expect(mockedSession.clearPending2FACookie).toHaveBeenCalledWith(res);

    expect(res._getJSONData()).toEqual({
      user: { id: 'u9' },
    });
  });
});
