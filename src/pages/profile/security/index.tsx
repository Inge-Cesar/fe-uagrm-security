import { useState } from 'react';
import Button from '@/components/Button';
import LoadingMoon from '@/components/loaders/LoadingMoon';
import EditPassword from '@/components/forms/EditPassword';
import usePasswordValidation from '@/hooks/usePasswordValidation';
import { ToastError, ToastSuccess } from '@/components/toast/alerts';
import { GetServerSideProps, GetServerSidePropsContext } from 'next';
import verifyAccess from '@/utils/api/auth/VerifyAccess';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/reducers';
import generateQRCode from '@/utils/api/auth/GenerateQRCode';
import verifyOTP from '@/utils/api/auth/VerifyOTP';
import confirm2FA from '@/utils/api/auth/Confirm2FA';
import { loadUser } from '@/redux/actions/auth/actions';
import { ThunkDispatch } from 'redux-thunk';
import { UnknownAction } from 'redux';
import { getValidImageUrl } from '@/utils/sanityImages';
import { ShieldCheck, QrCode, Lock, RefreshCw, ShieldAlert } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext,
) => {
  const { verified } = await verifyAccess(context);

  if (!verified) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};

export default function SecurityPage() {
  const dispatch: ThunkDispatch<any, any, UnknownAction> = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [loading, setLoading] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [repeatNewPassword, setRepeatNewPassword] = useState<string>('');

  // 2FA States
  const [showQR, setShowQR] = useState<boolean>(false);
  const [qrUrl, setQrUrl] = useState<string>('');
  const [otpCode, setOtpCode] = useState<string>('');
  const [verifying2FA, setVerifying2FA] = useState<boolean>(false);
  const [showDisableModal, setShowDisableModal] = useState<boolean>(false);

  const { canSubmit, PasswordValidationText } = usePasswordValidation({
    password: newPassword,
    rePassword: repeatNewPassword,
  });

  const handleChangePassword = async () => {
    if (!canSubmit) {
      ToastError('Debes completar todos los campos obligatorios');
      return null;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/change_password', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: newPassword,
          re_new_password: repeatNewPassword,
          current_password: currentPassword,
        }),
      });

      if (res.status === 204) {
        ToastSuccess('Tu contraseña ha sido actualizada');
        setCurrentPassword('');
        setNewPassword('');
        setRepeatNewPassword('');
      } else {
        const errorData = await res.json();
        ToastError(errorData.error || 'Error al cambiar la contraseña');
      }
    } catch (err) {
      ToastError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }

    return null;
  };

  const handleEnable2FA = async () => {
    try {
      setVerifying2FA(true);
      const res = await generateQRCode();
      const data = await res.json();
      if (res.status === 200) {
        setQrUrl(data.results);
        setShowQR(true);
      } else {
        ToastError('Error al generar el código QR');
      }
    } catch (err) {
      ToastError('Error de conexión con el servidor');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      ToastError('El código OTP debe ser de 6 dígitos');
      return;
    }

    try {
      setVerifying2FA(true);
      const res = await verifyOTP({ otp: otpCode });
      if (res.status === 200) {
        const confirmRes = await confirm2FA({ bool: true });
        if (confirmRes.status === 200) {
          ToastSuccess('¡2FA Activado con éxito!');
          setShowQR(false);
          setOtpCode('');
          await dispatch(loadUser());
        }
      } else {
        ToastError('Código OTP inválido');
      }
    } catch (err) {
      ToastError('Error al verificar el código OTP');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      setVerifying2FA(true);
      const res = await confirm2FA({ bool: false });
      if (res.status === 200) {
        ToastSuccess('¡2FA Desactivado!');
        await dispatch(loadUser());
        setShowDisableModal(false);
      }
    } catch (err) {
      ToastError('Error al desactivar el 2FA');
    } finally {
      setVerifying2FA(false);
    }
  };

  return (
    <DashboardLayout title="Seguridad y Protección">
      <div className="space-y-10">
        {/* --- CHANGE PASSWORD SECTION --- */}
        <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-6 border-b border-gray-50 pb-8 sm:flex-nowrap">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-red-600 shadow-sm border border-gray-100">
                  <Lock size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Cambiar Contraseña</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500 font-medium">Mantén tu cuenta protegida actualizando tu clave periódicamente.</p>
            </div>
            <div className="shrink-0">
              <Button
                style={{ width: '220px' }}
                disabled={loading}
                onClick={handleChangePassword}
                bgColor="bg-red-600 hover:bg-red-700"
                className="rounded-xl py-3.5 font-bold shadow-lg shadow-red-900/10 text-xs uppercase tracking-widest"
                hoverEffect
              >
                {loading ? <LoadingMoon /> : (
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw size={18} />
                    <span>Actualizar</span>
                  </div>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Contraseña Actual</label>
              <EditPassword data={currentPassword} setData={setCurrentPassword} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Nueva Contraseña</label>
              <EditPassword data={newPassword} setData={setNewPassword} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Repetir Contraseña</label>
              <EditPassword data={repeatNewPassword} setData={setRepeatNewPassword} />
            </div>
          </div>

          <div className="mt-6">
            {PasswordValidationText()}
          </div>
        </div>

        {/* --- 2FA SECTION --- */}
        <div className="relative overflow-hidden rounded-[2rem] border border-gray-100 bg-white p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between sm:flex-nowrap border-b border-gray-50 pb-8 mb-8 gap-6">
            <div>
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-blue-600 shadow-sm border border-gray-100">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Doble Factor (2FA)</h3>
              </div>
              <p className="mt-2 text-sm text-gray-500 font-medium">Añade una capa extra de seguridad institucional a tu cuenta.</p>
            </div>
            <div className="shrink-0">
              {user?.two_factor_enabled ? (
                <Button
                  bgColor="bg-gray-100 hover:bg-gray-200"
                  className="rounded-xl py-3.5 font-bold text-gray-700 text-xs uppercase tracking-widest border border-gray-200"
                  style={{ width: '220px' }}
                  disabled={verifying2FA}
                  onClick={() => setShowDisableModal(true)}
                  hoverEffect
                >
                  {verifying2FA ? <LoadingMoon /> : 'Desactivar 2FA'}
                </Button>
              ) : !showQR ? (
                <Button
                  className="rounded-xl py-3.5 font-bold shadow-lg shadow-blue-900/10 text-xs uppercase tracking-widest"
                  bgColor="bg-blue-600 hover:bg-blue-700"
                  style={{ width: '220px' }}
                  disabled={verifying2FA}
                  onClick={handleEnable2FA}
                  hoverEffect
                >
                  {verifying2FA ? <LoadingMoon /> : 'Configurar 2FA'}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="relative z-10">
            {user?.two_factor_enabled ? (
              <div className="flex items-center gap-6 rounded-2xl bg-green-50 p-6 text-green-700 border border-green-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-green-600 shadow-sm border border-green-100">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <p className="text-lg font-black">Autenticación activa</p>
                  <p className="mt-1 text-sm text-green-600/70 font-medium">Tu cuenta está protegida con código dinámico.</p>
                </div>
              </div>
            ) : showQR ? (
              <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white shadow-sm">1</div>
                    <p className="text-sm font-medium leading-relaxed text-gray-600">
                      Escanea este código QR con tu aplicación (Google Authenticator, Authy, etc.).
                    </p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-600 text-sm font-black text-white shadow-sm">2</div>
                    <div className="flex-1 space-y-4">
                      <p className="text-sm font-medium leading-relaxed text-gray-600">
                        Introduce los 6 dígitos generados para vincular tu dispositivo.
                      </p>
                      <div className="flex flex-wrap gap-4">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full max-w-[160px] rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-center text-2xl font-black tracking-[0.2em] text-gray-900 outline-none transition-all focus:border-red-600 focus:ring-4 focus:ring-red-600/10 placeholder:text-gray-300"
                          placeholder="000000"
                        />
                        <Button
                          disabled={verifying2FA || otpCode.length !== 6}
                          onClick={handleVerifyOTP}
                          className="rounded-xl font-black shadow-lg shadow-red-900/10 text-xs uppercase tracking-widest px-8"
                          bgColor="bg-red-600 hover:bg-red-700"
                        >
                          {verifying2FA ? <LoadingMoon /> : 'Activar'}
                        </Button>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowQR(false)}
                    className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors pt-4"
                  >
                    <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
                    <span>Cancelar Sincronización</span>
                  </button>
                </div>
                <div className="flex flex-col items-center justify-center rounded-3xl bg-gray-50 p-8 border border-gray-100">
                  <div className="relative rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                    {qrUrl && (
                      <img
                        src={getValidImageUrl(qrUrl) as string}
                        alt="2FA QR Code"
                        className="h-40 w-40 object-contain"
                      />
                    )}
                    <div className="absolute -right-3 -top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-lg">
                      <QrCode size={20} />
                    </div>
                  </div>
                  <p className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400">Escaneo de Seguridad</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6 rounded-2xl bg-gray-50 p-6 text-gray-500 border border-gray-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm border border-gray-100">
                  <ShieldAlert size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-900">Estado: Nivel 1</p>
                  <p className="mt-1 text-sm font-medium">Activa el segundo factor para elevar la seguridad institucional.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disable 2FA Confirmation Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-8 text-white">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tight">Desactivar 2FA</h3>
                  <p className="mt-1 text-sm text-red-100">Confirmación requerida</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8">
              <p className="text-gray-700 leading-relaxed">
                ¿Estás seguro de que deseas <span className="font-bold text-gray-900">desactivar la autenticación de doble factor</span>?
              </p>
              <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
                <div className="flex gap-3">
                  <ShieldAlert className="text-amber-600 shrink-0" size={20} />
                  <p className="text-sm text-amber-800 font-medium">
                    Tu cuenta quedará menos protegida. Recomendamos mantener el 2FA activo para mayor seguridad.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-gray-100 bg-gray-50 p-6">
              <button
                onClick={() => setShowDisableModal(false)}
                disabled={verifying2FA}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-bold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisable2FA}
                disabled={verifying2FA}
                className="flex-1 rounded-xl bg-red-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:bg-red-700 disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {verifying2FA ? <LoadingMoon /> : 'Desactivar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

SecurityPage.getLayout = function getLayout(page: React.ReactElement) {
  return <>{page}</>;
};
