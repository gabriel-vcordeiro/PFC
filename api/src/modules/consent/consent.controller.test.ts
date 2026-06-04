import httpMocks from 'node-mocks-http';
import { ConsentController } from './consent.controller';
import * as ConsentServiceModule from './consent.service';

jest.mock('./consent.service', () => {
  const mockRecordConsent = jest.fn();
  const mockGetConsentHistory = jest.fn();

  return {
    consentService: {
      recordConsent: mockRecordConsent,
      getConsentHistory: mockGetConsentHistory,
    },
    __mock: {
      mockRecordConsent,
      mockGetConsentHistory,
    },
    __esModule: true,
  };
});

type ConsentServiceModuleMock = typeof ConsentServiceModule & {
  __mock: {
    mockRecordConsent: jest.Mock;
    mockGetConsentHistory: jest.Mock;
  };
};

const consentServiceModule = jest.requireMock(
  './consent.service'
) as ConsentServiceModuleMock;

const { mockRecordConsent, mockGetConsentHistory } =
  consentServiceModule.__mock;

describe('ConsentController', () => {
  let controller: ConsentController;

  beforeEach(() => {
    jest.clearAllMocks();

    mockRecordConsent.mockReset();
    mockGetConsentHistory.mockReset();

    controller = new ConsentController();
  });

  const createConsentRequest = () =>
    httpMocks.createRequest({
      body: {
        consentimento_aceito: true,
        consentimento_finalidade: 'x',
        consentimento_versao: '1.0.0',
      },
    });

  test('RecordConsent retorna 401 quando usuário não é autorizado', async () => {
    const req = createConsentRequest();
    const res = httpMocks.createResponse();

    await controller.recordConsent(req as any, res as any);

    expect(res.statusCode).toBe(401);
  });

  test('RecordConsent retorna 201 quando é bem-sucedido', async () => {
    mockRecordConsent.mockResolvedValue({
      id: 'c1',
    });

    const req = createConsentRequest();
    const res = httpMocks.createResponse();

    (req as any).user = {
      userId: 'u1',
    };

    await controller.recordConsent(req as any, res as any);

    expect(mockRecordConsent).toHaveBeenCalled();

    expect(res.statusCode).toBe(201);

    expect(res._getJSONData()).toEqual({
      id: 'c1',
    });
  });
});