import { useState, useEffect } from "react";
import { Shield, CheckCircle, XCircle, Clock, Monitor } from "lucide-react";
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/reducers';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
    getDevices,
    authorizeDevice,
    revokeDevice,
    type UserDevice,
} from "@/utils/api/admin/devices";

export default function AdminDevicesPage() {
    const [devices, setDevices] = useState<UserDevice[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "pending" | "authorized" | "blocked">("all");

    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        loadDevices();
    }, [isAuthenticated, router]);

    const loadDevices = async () => {
        try {
            setLoading(true);
            const data = await getDevices();
            console.log('Devices data received:', data);
            // Ensure we always have an array
            setDevices(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error loading devices:", error);
            setDevices([]); // Set empty array on error
        } finally {
            setLoading(false);
        }
    };

    const handleAuthorize = async (deviceId: string) => {
        try {
            await authorizeDevice(deviceId);
            await loadDevices();
        } catch (error) {
            console.error("Error authorizing device:", error);
        }
    };

    const handleRevoke = async (deviceId: string) => {
        try {
            await revokeDevice(deviceId);
            await loadDevices();
        } catch (error) {
            console.error("Error revoking device:", error);
        }
    };

    const filteredDevices = devices.filter((device) => {
        if (filter === "pending") return !device.authorized && device.last_login;
        if (filter === "authorized") return device.authorized;
        if (filter === "blocked") return !device.authorized;
        return true;
    });

    if (loading && devices.length === 0) {
        return (
            <DashboardLayout title="Gestión de Dispositivos">
                <div className="flex h-[60vh] items-center justify-center">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Gestión de Dispositivos">
            {/* Header Section */}
            <div className="mb-10 rounded-3xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
                <div className="relative z-10">
                    <h3 className="mb-3 text-3xl font-black tracking-tight">Gestión de Dispositivos</h3>
                    <p className="text-lg text-slate-400 max-w-2xl">
                        Autoriza o bloquea dispositivos de usuarios para controlar el acceso al sistema.
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-600/20 to-transparent"></div>
                <Shield className="absolute -right-6 -bottom-6 h-56 w-56 text-white/5 rotate-12" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-8 ml-1">
                <div className="h-1 w-6 bg-blue-600 rounded-full"></div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Filtrar Dispositivos</h4>
            </div>

            <div className="flex gap-2 mb-6">
                {[
                    { key: "all", label: "Todos" },
                    { key: "pending", label: "Pendientes" },
                    { key: "authorized", label: "Autorizados" },
                    { key: "blocked", label: "Bloqueados" },
                ].map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key as typeof filter)}
                        className={`px - 4 py - 2 rounded - lg font - medium transition - colors ${filter === f.key
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-700 hover:bg-gray-100"
                            } `}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Device List */}
            <div className="grid gap-4">
                {filteredDevices.map((device) => (
                    <DeviceCard
                        key={device.id}
                        device={device}
                        onAuthorize={() => handleAuthorize(device.id)}
                        onRevoke={() => handleRevoke(device.id)}
                    />
                ))}
                {filteredDevices.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 text-center shadow-xl border border-slate-100 ring-1 ring-slate-200/50">
                        <div className="mb-6 rounded-2xl bg-slate-50 p-6 text-slate-300">
                            <Monitor size={48} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No hay dispositivos</h3>
                        <p className="text-slate-500 max-w-sm">No hay dispositivos en esta categoría</p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

AdminDevicesPage.getLayout = function getLayout(page: React.ReactElement) {
    return <>{page}</>;
};

interface DeviceCardProps {
    device: UserDevice;
    onAuthorize: () => void;
    onRevoke: () => void;
}

function DeviceCard({ device, onAuthorize, onRevoke }: DeviceCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
                {/* User & Device Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Monitor className="w-5 h-5 text-gray-600" />
                        <h3 className="text-lg font-semibold text-gray-900">
                            {device.user.first_name} {device.user.last_name}
                        </h3>
                        {device.authorized ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                        <strong>Email:</strong> {device.user.email || device.user.username}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                        <strong>Dispositivo:</strong> {device.device.hostname}
                    </p>
                    <p className="text-sm text-gray-500 font-mono">
                        {device.device.device_hash.substring(0, 16)}...
                    </p>
                    {device.last_login && (
                        <p className="text-xs text-gray-500 mt-2">
                            Último acceso: {new Date(device.last_login).toLocaleString()} desde{" "}
                            {device.last_ip}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    {!device.authorized ? (
                        <button
                            onClick={onAuthorize}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Autorizar
                        </button>
                    ) : (
                        <button
                            onClick={onRevoke}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <XCircle className="w-4 h-4" />
                            Bloquear
                        </button>
                    )}
                    <button
                        onClick={() => setShowDetails(!showDetails)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        {showDetails ? "Ocultar" : "Ver"} Componentes
                    </button>
                </div>
            </div>

            {/* Hardware Fingerprint */}
            {showDetails && device.fingerprint && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Rastro de Hardware:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                        <div>
                            <strong className="text-gray-900">UUID Sistema:</strong> {device.fingerprint.uuid_sistema}
                        </div>
                        <div>
                            <strong className="text-gray-900">CPU Serial:</strong> {device.fingerprint.numero_serie_cpu}
                        </div>
                        <div>
                            <strong className="text-gray-900">Disco Serial:</strong> {device.fingerprint.numero_serie_disco}
                        </div>
                        <div>
                            <strong className="text-gray-900">MAC Address:</strong> {device.fingerprint.mac_address}
                        </div>
                        <div>
                            <strong className="text-gray-900">Baseboard:</strong> {device.fingerprint.baseboard_serial}
                        </div>
                        <div>
                            <strong className="text-gray-900">Nombre Máquina:</strong> {device.fingerprint.nombre_maquina}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
