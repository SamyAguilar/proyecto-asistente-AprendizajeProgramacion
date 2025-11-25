// lib/screens/auth/login_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../home/home_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();

  bool _rememberEmail = true;
  String? _emailError;
  bool _isEmailValid = false;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _setupEmailListener();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadLastEmail();
    });
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOutCubic,
      ),
    );

    _animationController.forward();
  }

  void _setupEmailListener() {
    _emailController.addListener(() {
      final email = _emailController.text;
      final error = _validateEmail(email);

      setState(() {
        _emailError = email.isEmpty ? null : error;
        _isEmailValid = error == null && email.isNotEmpty;
      });
    });
  }

  String? _validateEmail(String? email) {
    if (email == null || email.isEmpty) {
      return 'El correo es requerido';
    }

    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    if (!emailRegex.hasMatch(email.trim().toLowerCase())) {
      return 'Ingresa un correo valido';
    }

    return null;
  }

  void _loadLastEmail() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    if (authProvider.lastEmail != null && authProvider.lastEmail!.isNotEmpty) {
      _emailController.text = authProvider.lastEmail!;
      setState(() {
        _isEmailValid = true;
      });
    }
  }

  @override
  void dispose() {
    _animationController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    if (_rememberEmail) {
      await authProvider.saveLastEmail(_emailController.text);
    }

    final success = await authProvider.login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) => const HomeScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(opacity: animation, child: child);
          },
          transitionDuration: const Duration(milliseconds: 300),
        ),
      );
    } else {
      _showError(authProvider.error ?? 'Error al iniciar sesion');
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.error_outline, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppTheme.errorColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  void _navigateToRegister() {
    Navigator.push(
      context,
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => const RegisterScreen(),
        transitionsBuilder: (context, animation, secondaryAnimation, child) {
          return SlideTransition(
            position: Tween<Offset>(
              begin: const Offset(1.0, 0.0),
              end: Offset.zero,
            ).animate(CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            )),
            child: child,
          );
        },
        transitionDuration: const Duration(milliseconds: 300),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // Detectar si es modo oscuro
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimaryColor = isDark ? AppTheme.textPrimaryColorDark : AppTheme.textPrimaryColor;
    final textSecondaryColor = isDark ? AppTheme.textSecondaryColorDark : AppTheme.textSecondaryColor;
    final backgroundColor = isDark ? AppTheme.backgroundColorDark : AppTheme.backgroundColor;

    return Scaffold(
      backgroundColor: backgroundColor,
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SlideTransition(
            position: _slideAnimation,
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 48),

                    // Logo
                    Center(
                      child: Hero(
                        tag: 'app_logo',
                        child: Container(
                          width: 100,
                          height: 100,
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor,
                            borderRadius: BorderRadius.circular(20),
                            boxShadow: [
                              BoxShadow(
                                color: AppTheme.primaryColor.withOpacity(0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 10),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.school,
                            size: 50,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Titulo
                    Text(
                      'Bienvenido',
                      style: TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.bold,
                        color: textPrimaryColor,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Inicia sesion para continuar',
                      style: TextStyle(
                        fontSize: 16,
                        color: textSecondaryColor,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),

                    // Campo de email
                    _buildEmailField(isDark, textPrimaryColor, textSecondaryColor),
                    const SizedBox(height: 20),

                    // Campo de password
                    PasswordTextField(
                      controller: _passwordController,
                      focusNode: _passwordFocusNode,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _handleLogin(),
                    ),
                    const SizedBox(height: 16),

                    // Recordar email
                    Row(
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: _rememberEmail,
                            onChanged: (value) {
                              setState(() {
                                _rememberEmail = value ?? true;
                              });
                            },
                            activeColor: AppTheme.primaryColor,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        GestureDetector(
                          onTap: () {
                            setState(() {
                              _rememberEmail = !_rememberEmail;
                            });
                          },
                          child: Text(
                            'Recordar mi correo',
                            style: TextStyle(
                              color: textSecondaryColor,
                              fontSize: 14,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Boton de login
                    Consumer<AuthProvider>(
                      builder: (context, auth, _) {
                        return CustomButton(
                          text: 'Iniciar Sesion',
                          onPressed: _handleLogin,
                          isLoading: auth.isLoading,
                        );
                      },
                    ),
                    const SizedBox(height: 24),

                    // Link a registro
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          'No tienes cuenta? ',
                          style: TextStyle(
                            color: textSecondaryColor,
                          ),
                        ),
                        TextButton(
                          onPressed: _navigateToRegister,
                          child: const Text(
                            'Registrate',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildEmailField(bool isDark, Color textPrimaryColor, Color textSecondaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Correo electronico',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: textPrimaryColor,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: _emailController,
          focusNode: _emailFocusNode,
          keyboardType: TextInputType.emailAddress,
          textInputAction: TextInputAction.next,
          onFieldSubmitted: (_) {
            FocusScope.of(context).requestFocus(_passwordFocusNode);
          },
          validator: _validateEmail,
          style: TextStyle(
            fontSize: 16,
            color: textPrimaryColor,
          ),
          decoration: InputDecoration(
            hintText: 'ejemplo@correo.com',
            hintStyle: TextStyle(color: textSecondaryColor),
            prefixIcon: Icon(
              Icons.email_outlined,
              color: textSecondaryColor,
              size: 22,
            ),
            suffixIcon: _emailController.text.isNotEmpty
                ? Icon(
              _isEmailValid ? Icons.check_circle : Icons.error,
              color: _isEmailValid ? AppTheme.secondaryColor : AppTheme.errorColor,
              size: 22,
            )
                : null,
            errorText: _emailError,
          ),
        ),
      ],
    );
  }
}