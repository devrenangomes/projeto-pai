import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Layout, Mail, Lock, Loader2, ArrowRight } from 'lucide-react';

const Auth = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Verifique seu email para confirmar o cadastro!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="p-3 bg-emerald-600 rounded-xl text-white mb-4 shadow-lg shadow-emerald-200">
                            <Layout size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">StaffGrid</h1>
                        <p className="text-slate-500 mt-2 text-center">
                            {isSignUp ? 'Crie sua conta para começar' : 'Bem-vindo de volta'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    type="email"
                                    placeholder="seu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium text-slate-700 ml-1">Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100 flex items-start gap-2 animate-in shake">
                                <span className="font-bold">Erro:</span> {error}
                            </div>
                        )}

                        {message && (
                            <div className="p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg border border-emerald-100 animate-in fade-in">
                                {message}
                            </div>
                        )}

                        <Button
                            variant="primary"
                            className="w-full justify-center py-2.5 text-base mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    {isSignUp ? 'Criar Conta' : 'Entrar'}
                                    <ArrowRight size={18} className="ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>

                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-center">
                    <p className="text-sm text-slate-600">
                        {isSignUp ? 'Já tem uma conta?' : 'Não tem uma conta?'}
                        <button
                            onClick={() => {
                                setIsSignUp(!isSignUp);
                                setError(null);
                                setMessage(null);
                            }}
                            className="ml-2 text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
                        >
                            {isSignUp ? 'Fazer Login' : 'Criar agora'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Auth;
