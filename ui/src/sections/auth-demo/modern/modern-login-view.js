/* eslint-disable no-nested-ternary */
/* eslint-disable no-useless-escape */
/* eslint-disable import/no-extraneous-dependencies */
import * as Yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import LoadingButton from '@mui/lab/LoadingButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';

import { Box } from '@mui/system';
import Alert from '@mui/material/Alert';
import Iconify from 'src/components/iconify';
import FormProvider, { RHFCode, RHFTextField } from 'src/components/hook-form';
import { useState } from 'react';
import { useAuthContext } from 'src/auth/hooks';
import { PATH_AFTER_LOGIN } from 'src/config-global';
import { useSearchParams, useRouter } from 'src/routes/hook';
import { useSnackbar } from 'notistack';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import { Button, Card, IconButton, InputAdornment } from '@mui/material';
import { RouterLink } from 'src/routes/components';
import { paths } from 'src/routes/paths';

export default function ModernLoginView() {
  const password = useBoolean();
  const { login } = useAuthContext();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();

  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: '',
    password: '',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    setValue,
    reset,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await login?.(data.email, data.password);
      router.push(returnTo || PATH_AFTER_LOGIN);
    } catch (error) {
      console.log(typeof error);
      console.log(error);
      console.log(error.message);
      if (typeof error !== 'string' && error?.error?.statusCode === 500) {
        enqueueSnackbar('Invalid Credentials', {
          variant: 'error',
        });
      } else {
        enqueueSnackbar(
          typeof error === 'string'
            ? error
            : error?.error?.message
            ? error?.error?.message
            : error?.message,
          {
            variant: 'error',
          }
        );
      }
    }
  });

  return (
    <Card
      sx={{
        py: 5,
        px: 3,
        maxWidth: 720,
        width: '100%',
      }}
    >
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <Stack mb={2} sx={{ mb: 5 }}>
          <Typography variant="h4">Login</Typography>
        </Stack>

        <Stack spacing={2.5}>
          <RHFTextField name="email" label="Email address" />

          <RHFTextField
            name="password"
            label="Password"
            type={password.value ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={password.onToggle} edge="end">
                    <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Link
            component={RouterLink}
            href={paths.auth.jwt.forgotPassword}
            variant="body2"
            color="inherit"
            underline="always"
            sx={{ alignSelf: 'flex-end' }}
          >
            Forgot password?
          </Link>

          <LoadingButton
            fullWidth
            color="inherit"
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Login
          </LoadingButton>
        </Stack>
      </FormProvider>
    </Card>
  );
}
