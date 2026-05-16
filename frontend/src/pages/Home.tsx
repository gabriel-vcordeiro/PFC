import { useContext } from "react"
import { AuthContext } from "../context/AuthContextType"
import { useNavigate } from 'react-router-dom';

export default function Home(){
    const {userID, logOut} = useContext(AuthContext);
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <h1 className="text-4xl font-semibold text-gray-900 mb-2">Dashboard</h1>
                    <p className="text-gray-600 mb-6">Bem-vindo de volta! ID: {userID}</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-16">
                {/* Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Settings Card */}
                    <button
                        onClick={() => navigate('/settings')}
                        className="group p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Configurações</h3>
                        <p className="text-sm text-gray-600">Gerencie sua segurança</p>
                    </button>

                    {/* Profile Card */}
                    <button
                        onClick={() => navigate('/profile')}
                        className="group p-6 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Perfil</h3>
                        <p className="text-sm text-gray-600">Suas informações</p>
                    </button>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => logOut()}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                        Sair da Conta
                    </button>
                </div>
            </div>
        </div>
    )
}