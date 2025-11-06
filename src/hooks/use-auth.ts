import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { INITIAL_ADMIN } from '@/lib/config/trading';
import { toast } from 'sonner';

// Form şemaları
const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır')
});

const registrationSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: z.string(),
  firstName: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  lastName: z.string().min(2, 'Soyisim en az 2 karakter olmalıdır'),
  phone: z.string().min(10, 'Geçerli bir telefon numarası girin'),
  country: z.string().min(2, 'Ülke seçin'),
  acceptTerms: z.boolean().refine(val => val === true, 'Kullanım koşullarını kabul etmelisiniz')
}).refine(data => data.password === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword']
});

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      // Demo admin girişi kontrolü
      if (email === INITIAL_ADMIN.email && password === INITIAL_ADMIN.password) {
        // Supabase'de admin hesabı yoksa oluştur
        const { data: existingUser } = await supabase
          .from('profiles')
          .select()
          .eq('email', INITIAL_ADMIN.email)
          .single();

        if (!existingUser) {
          const { data: { user }, error: signUpError } = await supabase.auth.signUp({
            email: INITIAL_ADMIN.email,
            password: INITIAL_ADMIN.password
          });

          if (signUpError) throw signUpError;

          if (user) {
            await supabase.from('profiles').insert([
              {
                id: user.id,
                email: INITIAL_ADMIN.email,
                role: 'admin',
                is_verified: true,
                created_at: new Date().toISOString()
              }
            ]);
          }
        }
      }

      // Normal giriş işlemi
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Profil bilgilerini getir
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (profile?.is_verified) {
        toast.success('Başarıyla giriş yapıldı!');
        return { user: data.user, profile };
      } else {
        throw new Error('Hesabınız henüz onaylanmamış. Lütfen e-posta onayınızı tamamlayın.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Giriş yapılırken bir hata oluştu';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData: z.infer<typeof registrationSchema>) => {
    setLoading(true);
    setError(null);

    try {
      // Form validasyonu
      await registrationSchema.parseAsync(formData);

      // Kullanıcı kaydı
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (signUpError) throw signUpError;

      if (!user) throw new Error('Kullanıcı kaydı başarısız');

      // Profil oluşturma
      await supabase.from('profiles').insert([
        {
          id: user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          country: formData.country,
          role: 'user',
          is_verified: false,
          created_at: new Date().toISOString()
        }
      ]);

      toast.success('Kayıt başarılı! Lütfen e-posta adresinizi onaylayın.');
      return user;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Kayıt olurken bir hata oluştu';
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Başarıyla çıkış yapıldı');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Çıkış yapılırken bir hata oluştu';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Şifre sıfırlama işlemi başarısız';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    resetPassword,
    loading,
    error
  };
};

export type { z };