import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  GlobalSignOutCommand,
  AdminDeleteUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { createHmac } from 'crypto';
import { config } from '../../config/env';

// Create Cognito client instance lazily
let cognitoClientInstance: CognitoIdentityProviderClient | null = null;

const getCognitoClient = (): CognitoIdentityProviderClient => {
  if (!cognitoClientInstance) {
    cognitoClientInstance = new CognitoIdentityProviderClient({
      region: config.AWS_REGION,
      credentials: {
        accessKeyId: config.AWS_ACCESS_KEY_ID,
        secretAccessKey: config.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return cognitoClientInstance;
};

/**
 * Compute SECRET_HASH for Cognito requests when client secret is configured
 */
const computeSecretHash = (username: string): string | undefined => {
  if (!config.AWS_COGNITO_CLIENT_SECRET) {
    return undefined;
  }
  
  const message = username + config.AWS_COGNITO_CLIENT_ID;
  const hmac = createHmac('sha256', config.AWS_COGNITO_CLIENT_SECRET);
  hmac.update(message);
  return hmac.digest('base64');
};

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

export interface SignUpResult {
  userSub: string;
  userConfirmed: boolean;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  idToken: string;
  expiresIn: number;
}

/**
 * Register a new user in AWS Cognito
 */
export const signUpUser = async (params: SignUpParams): Promise<SignUpResult> => {
  try {
    const secretHash = computeSecretHash(params.email);
    
    const command = new SignUpCommand({
      ClientId: config.AWS_COGNITO_CLIENT_ID,
      Username: params.email,
      Password: params.password,
      SecretHash: secretHash,
      UserAttributes: [
        { Name: 'email', Value: params.email },
        { Name: 'name', Value: params.name },
      ],
    });

    const response = await getCognitoClient().send(command);

    return {
      userSub: response.UserSub!,
      userConfirmed: response.UserConfirmed || false,
    };
  } catch (error: any) {
    console.error('Cognito SignUp error:', error);
    throw new Error(error.name || 'COGNITO_SIGNUP_ERROR');
  }
};

/**
 * Authenticate user with email and password
 */
export const loginUser = async (params: LoginParams): Promise<LoginResult> => {
  try {
    const secretHash = computeSecretHash(params.email);
    
    const authParameters: Record<string, string> = {
      USERNAME: params.email,
      PASSWORD: params.password,
    };
    
    if (secretHash) {
      authParameters.SECRET_HASH = secretHash;
    }
    
    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: config.AWS_COGNITO_CLIENT_ID,
      AuthParameters: authParameters,
    });

    const response = await getCognitoClient().send(command);

    if (!response.AuthenticationResult) {
      throw new Error('AUTHENTICATION_FAILED');
    }

    return {
      accessToken: response.AuthenticationResult.AccessToken!,
      refreshToken: response.AuthenticationResult.RefreshToken!,
      idToken: response.AuthenticationResult.IdToken!,
      expiresIn: response.AuthenticationResult.ExpiresIn || 3600,
    };
  } catch (error: any) {
    console.error('Cognito Login error:', error);
    throw new Error(error.name || 'COGNITO_LOGIN_ERROR');
  }
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (refreshToken: string, username?: string): Promise<string> => {
  try {
    const authParameters: Record<string, string> = {
      REFRESH_TOKEN: refreshToken,
    };
    
    // For refresh token, we need the username to compute SECRET_HASH
    // If not provided, SECRET_HASH won't be included (works for public clients)
    if (username && config.AWS_COGNITO_CLIENT_SECRET) {
      const secretHash = computeSecretHash(username);
      if (secretHash) {
        authParameters.SECRET_HASH = secretHash;
      }
    }
    
    const command = new InitiateAuthCommand({
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: config.AWS_COGNITO_CLIENT_ID,
      AuthParameters: authParameters,
    });

    const response = await getCognitoClient().send(command);

    if (!response.AuthenticationResult?.AccessToken) {
      throw new Error('TOKEN_REFRESH_FAILED');
    }

    return response.AuthenticationResult.AccessToken;
  } catch (error: any) {
    console.error('Cognito Refresh error:', error);
    throw new Error(error.name || 'COGNITO_REFRESH_ERROR');
  }
};

/**
 * Global sign out - invalidates all tokens for user
 */
export const signOutUser = async (accessToken: string): Promise<void> => {
  try {
    const command = new GlobalSignOutCommand({
      AccessToken: accessToken,
    });

    await getCognitoClient().send(command);
  } catch (error: any) {
    console.error('Cognito SignOut error:', error);
    throw new Error(error.name || 'COGNITO_SIGNOUT_ERROR');
  }
};

/**
 * Delete user from Cognito (admin operation for cleanup)
 */
export const deleteUser = async (username: string): Promise<void> => {
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: config.AWS_COGNITO_USER_POOL_ID,
      Username: username,
    });

    await getCognitoClient().send(command);
  } catch (error: any) {
    console.error('Cognito DeleteUser error:', error);
    // Don't throw - this is best effort cleanup
  }
};

