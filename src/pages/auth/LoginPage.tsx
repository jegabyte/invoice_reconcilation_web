import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/auth.slice';

export default function LoginPage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse: TokenResponse) => {
            dispatch(loginStart());
            
            try {
                // Get user info from Google using the access token
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${tokenResponse.access_token}`
                    }
                });
                
                if (!userInfoResponse.ok) {
                    throw new Error('Failed to get user info');
                }
                
                const userInfo = await userInfoResponse.json();
                
                // Store the access token in localStorage for API calls
                localStorage.setItem('googleAccessToken', tokenResponse.access_token);
                
                // For Cloud Run authenticated endpoints, we need to get an ID token
                // targeting the Cloud Run service URL
                const cloudRunUrl = 'https://invoice-api-stub-hibcblchwq-uc.a.run.app';
                try {
                    // Request an ID token for the Cloud Run service
                    const idTokenResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${tokenResponse.access_token}`);
                    if (idTokenResponse.ok) {
                        const tokenInfo = await idTokenResponse.json();
                        console.log('Token info:', tokenInfo);
                    }
                } catch (e) {
                    console.error('Failed to get ID token:', e);
                }
                
                // Create user object from Google user info
                const user = {
                    id: userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name || userInfo.email.split('@')[0],
                    picture: userInfo.picture,
                    role: 'admin' as const,
                    accessToken: tokenResponse.access_token
                };
                
                dispatch(loginSuccess(user));
                navigate('/invoices');
            } catch (error) {
                console.error('Login error:', error);
                dispatch(loginFailure('Failed to login with Google'));
            }
        },
        onError: (error) => {
            console.error('Google login error:', error);
            dispatch(loginFailure('Google login failed'));
        },
        scope: 'openid email profile'
    });

    // Check if user is already logged in
    useEffect(() => {
        const token = localStorage.getItem('googleAccessToken');
        if (token) {
            // Validate token and redirect if valid
            fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }).then(response => {
                if (response.ok) {
                    navigate('/invoices');
                } else {
                    localStorage.removeItem('googleAccessToken');
                }
            }).catch(() => {
                localStorage.removeItem('googleAccessToken');
            });
        }
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-6">
                <div>
                    <div className="flex justify-center">
                        <img 
                            src="https://images.squarespace-cdn.com/content/v1/5a5dbe4632601eb31977f947/1724050307112-W8G9KOZ3F7LQBY48NSWI/logo_AirAsiaMOVE.png"
                            alt="AirAsia MOVE"
                            className="h-48 w-auto"
                        />
                    </div>
                    <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
                        Invoice Reconciliation Portal
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in with your Google account to continue
                    </p>
                </div>
                
                <div className="mt-8">
                    <button
                        onClick={() => googleLogin()}
                        className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Sign in with Google
                    </button>
                </div>
                
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>By signing in, you agree to our terms of service and privacy policy.</p>
                </div>
            </div>
        </div>
    );
}