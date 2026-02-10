interface Sistema {
    id: number;
    nombre: string;
    url: string;
    icono: string;
    descripcion: string;
    color: string;
}

interface Rol {
    id: number;
    nombre: string;
}

interface Usuario {
    id: number;
    email: string;
    nombre: string;
    rol: Rol;
}

export interface MisSistemasResponse {
    results: {
        usuario: Usuario;
        sistemas: Sistema[];
    };
}

export default async function getMisSistemas(): Promise<MisSistemasResponse | null> {
    try {
        const res = await fetch('/api/auth/mis-sistemas', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.status === 200) {
            const data = await res.json();
            return data;
        } else {
            console.error('Error fetching systems:', res.statusText);
            return null;
        }
    } catch (err) {
        console.error('Error fetching systems:', err);
        return null;
    }
}
