// ============================================================
// AUTH MODULE - إدارة المصادقة
// ============================================================

const Auth = {
    currentUser: null,
    currentUserData: null,

    // ============================================================
    // INIT
    // ============================================================
    
    init() {
        if (typeof supabaseClient === 'undefined') {
            console.warn('⚠️ Supabase client not available');
            return;
        }
        
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event);
            
            if (session) {
                this.currentUser = session.user;
                await this.loadUserData(this.currentUser.id);
                UI.updateForLoggedInUser();
                await Cart.syncFromSupabase();
            } else {
                this.currentUser = null;
                this.currentUserData = null;
                UI.updateForGuestUser();
                Cart.loadLocal();
                Cart.updateUI();
            }
        });
    },

    // ============================================================
    // LOAD USER DATA
    // ============================================================
    
    async loadUserData(userId) {
        try {
            if (typeof supabaseClient === 'undefined') return;
            
            const { data, error } = await supabaseClient
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;
            
            if (data) {
                this.currentUserData = data;
            } else {
                const newUser = {
                    id: userId,
                    email: this.currentUser.email,
                    display_name: this.currentUser.user_metadata?.full_name || 
                                 this.currentUser.email?.split('@')[0] || 'مستخدم',
                    phone: '',
                    address: '',
                    referral_points: 0,
                    referral_count: 0,
                    created_at: new Date().toISOString()
                };
                
                const { error: insertError } = await supabaseClient
                    .from('users')
                    .insert([newUser]);
                
                if (insertError && insertError.code !== '23505') throw insertError;
                this.currentUserData = newUser;
            }
        } catch (error) {
            console.error('❌ Error loading user data:', error);
        }
    },

    // ============================================================
    // LOGIN
    // ============================================================
    
    async loginWithEmail(email, password) {
        if (!email || !password) {
            showToast('⚠️ الرجاء إدخال البريد وكلمة المرور', 'error');
            return;
        }
        
        try {
            if (typeof supabaseClient === 'undefined') {
                showToast('⚠️ Supabase غير متصل', 'error');
                return;
            }
            
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });
            
            if (error) throw error;
            
            showToast('تم تسجيل الدخول بنجاح! 🎉', 'success');
            closeAuthModal();
        } catch (error) {
            console.error('❌ Login error:', error);
            showToast(error.message || 'حدث خطأ في تسجيل الدخول', 'error');
            
            const loginError = document.getElementById('loginError');
            if (loginError) {
                loginError.textContent = error.message || 'حدث خطأ';
                loginError.classList.add('show');
            }
        }
    },

    // ============================================================
    // SIGNUP
    // ============================================================
    
    async signupWithEmail(email, password, displayName) {
        if (!email || !password || !displayName) {
            showToast('⚠️ الرجاء ملء جميع الحقول', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('⚠️ كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'error');
            return;
        }
        
        try {
            if (typeof supabaseClient === 'undefined') {
                showToast('⚠️ Supabase غير متصل', 'error');
                return;
            }
            
            const { data, error } = await supabaseClient.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: { full_name: displayName }
                }
            });
            
            if (error) throw error;
            
            showToast('تم إنشاء الحساب بنجاح! 🎉', 'success');
            closeAuthModal();
        } catch (error) {
            console.error('❌ Signup error:', error);
            showToast(error.message || 'حدث خطأ في إنشاء الحساب', 'error');
            
            const signupError = document.getElementById('signupError');
            if (signupError) {
                signupError.textContent = error.message || 'حدث خطأ';
                signupError.classList.add('show');
            }
        }
    },

    // ============================================================
    // GOOGLE LOGIN
    // ============================================================
    
    async loginWithGoogle() {
        const googleBtn = document.getElementById('googleBtn');
        if (googleBtn) {
            googleBtn.disabled = true;
            googleBtn.innerHTML = '<span class="fa fa-spinner fa-spin"></span> جاري...';
        }
        
        try {
            if (typeof supabaseClient === 'undefined') {
                showToast('⚠️ Supabase غير متصل', 'error');
                if (googleBtn) {
                    googleBtn.disabled = false;
                    googleBtn.innerHTML = `
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                        <span>تسجيل الدخول بجوجل</span>
                    `;
                }
                return;
            }
            
            const redirectUrl = window.location.origin + window.location.pathname;
            
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: redirectUrl }
            });
            
            if (error) throw error;
            
            showToast('جاري التوجيه إلى جوجل...', 'info');
        } catch (error) {
            console.error('❌ Google login error:', error);
            showToast(error.message || 'حدث خطأ في تسجيل الدخول بجوجل', 'error');
            
            if (googleBtn) {
                googleBtn.disabled = false;
                googleBtn.innerHTML = `
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
                    <span>تسجيل الدخول بجوجل</span>
                `;
            }
        }
    },

    // ============================================================
    // LOGOUT
    // ============================================================
    
    async logout() {
        try {
            if (typeof supabaseClient !== 'undefined') {
                await supabaseClient.auth.signOut();
            }
            
            showToast('تم تسجيل الخروج', 'info');
            
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) dropdown.classList.remove('show');
            
            Cart.loadLocal();
            Cart.updateUI();
            UI.updateForGuestUser();
        } catch (error) {
            console.error('❌ Logout error:', error);
            showToast('حدث خطأ أثناء تسجيل الخروج', 'error');
        }
    },

    // ============================================================
    // RESET PASSWORD
    // ============================================================
    
    async resetPassword(email) {
        if (!email) {
            showToast('⚠️ أدخل بريدك الإلكتروني أولاً', 'error');
            return;
        }
        
        try {
            if (typeof supabaseClient === 'undefined') {
                showToast('⚠️ Supabase غير متصل', 'error');
                return;
            }
            
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.href
            });
            
            if (error) throw error;
            
            showToast('✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك', 'success');
        } catch (error) {
            console.error('❌ Reset password error:', error);
            showToast(error.message || 'حدث خطأ', 'error');
        }
    },

    // ============================================================
    // GETTERS
    // ============================================================
    
    getUser() {
        return this.currentUser;
    },
    
    getUserData() {
        return this.currentUserData;
    },
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
};

// ============================================================
// EXPORT
// ============================================================

window.Auth = Auth; 
