export type ApiErrorCode =
  | 'CONSENT_REQUIRED'
  | 'VALIDATION_ERROR'
  | 'IDEMPOTENCY_KEY_REQUIRED'
  | 'INTERNAL_ERROR';

export type ApiErrorBody = {
  error_code: ApiErrorCode;
  message: string;
};

export const ERRORS: Record<ApiErrorCode, ApiErrorBody> = {
  CONSENT_REQUIRED: {
    error_code: 'CONSENT_REQUIRED',
    message: 'Consent is required.'
  },
  VALIDATION_ERROR: {
    error_code: 'VALIDATION_ERROR',
    message: 'Request is invalid.'
  },
  IDEMPOTENCY_KEY_REQUIRED: {
    error_code: 'IDEMPOTENCY_KEY_REQUIRED',
    message: 'Idempotency key is required.'
  },
  INTERNAL_ERROR: {
    error_code: 'INTERNAL_ERROR',
    message: 'Internal error.'
  }
};
