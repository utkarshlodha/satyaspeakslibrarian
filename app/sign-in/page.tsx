'use client'

import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In - Satya Speaks',
  description: 'Sign in to your account',
};

export default function SignInPage() {
  return <SignIn />;
}
