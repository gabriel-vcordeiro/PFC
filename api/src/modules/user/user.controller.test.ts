import httpMocks from 'node-mocks-http';
import { UserController } from './user.controller';
import * as UserServiceModule from './user.service';

jest.mock('./user.service', () => {
  const mockGetUserData = jest.fn();
  const mockDeleteUserData = jest.fn();
  const mockExportUserData = jest.fn();

  return {
    UserService: jest.fn(() => ({
      getUserData: mockGetUserData,
      deleteUserData: mockDeleteUserData,
      exportUserData: mockExportUserData,
    })),
    __mock: {
      mockGetUserData,
      mockDeleteUserData,
      mockExportUserData,
    },
    __esModule: true,
  };
});

type UserServiceModuleMock = typeof UserServiceModule & {
  __mock: {
    mockGetUserData: jest.Mock;
    mockDeleteUserData: jest.Mock;
    mockExportUserData: jest.Mock;
  };
};

const userServiceModule = jest.requireMock(
  './user.service'
) as UserServiceModuleMock;

const {
  mockGetUserData,
  mockDeleteUserData,
  mockExportUserData,
} = userServiceModule.__mock;

describe('UserController', () => {
  let controller: UserController;

  beforeEach(() => {
    jest.clearAllMocks();

    mockGetUserData.mockReset();
    mockDeleteUserData.mockReset();
    mockExportUserData.mockReset();

    controller = new UserController();
  });

  test('GetUserData retorna 401 sem usuário autenticado', async () => {
    const req = httpMocks.createRequest();
    const res = httpMocks.createResponse();

    await controller.getUserData(req as any, res as any);

    expect(res.statusCode).toBe(401);
  });

  test('GetUserData retorna dados do usuário quando autenticado', async () => {
    mockGetUserData.mockResolvedValue({
      id: 'u1',
      email: 'a@b.com',
    });

    const req = httpMocks.createRequest();
    (req as any).user = {
      userId: 'u1',
    };

    const res = httpMocks.createResponse();

    await controller.getUserData(req as any, res as any);

    expect(mockGetUserData).toHaveBeenCalledWith('u1');

    expect(res._getJSONData()).toEqual({
      id: 'u1',
      email: 'a@b.com',
    });
  });
});