// lib/screens/auth/register_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';
import '../home/home_screen.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _apellidoController = TextEditingController();
  final _emailController = TextEditingController();
  final _matriculaController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  final _nombreFocusNode = FocusNode();
  final _apellidoFocusNode = FocusNode();
  final _emailFocusNode = FocusNode();
  final _matriculaFocusNode = FocusNode();
  final _passwordFocusNode = FocusNode();
  final _confirmPasswordFocusNode = FocusNode();

  bool _isEmailValid = false;
  bool _isPasswordValid = false;
  bool _passwordsMatch = false;

  bool _hasMinLength = false;
  bool _hasUppercase = false;
  bool _hasLowercase = false;
  bool _hasNumber = false;

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _setupListeners();
  }

  void _setupAnimations() {
    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeInOut,
      ),
    );

    _animationController.forward();
  }

  void _setupListeners() {
    _emailController.addListener(() {
      final email = _emailController.text;
      final isValid = _validateEmailFormat(email);

      setState(() {
        _isEmailValid = isValid && email.isNotEmpty;
      });
    });

    _passwordController.addListener(_validatePasswordRealtime);

    _confirmPasswordController.addListener(() {
      setState(() {
        _passwordsMatch = _confirmPasswordController.text == _passwordController.text &&
            _confirmPasswordController.text.isNotEmpty;
      });
    });
  }

  bool _validateEmailFormat(String email) {
    if (email.isEmpty) return false;
    final emailRegex = RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$');
    return emailRegex.hasMatch(email.trim().toLowerCase());
  }

  String? _validateEmail(String? email) {
    if (email == null || email.isEmpty) {
      return 'El correo es requerido';
    }
    if (!_validateEmailFormat(email)) {
      return 'Ingresa un correo valido';
    }
    return null;
  }

  String? _validateName(String? name, String fieldName) {
    if (name == null || name.trim().isEmpty) {
      return '$fieldName es requerido';
    }
    if (name.trim().length < 2) {
      return '$fieldName debe tener al menos 2 caracteres';
    }
    if (name.trim().length > 50) {
      return '$fieldName no puede tener mas de 50 caracteres';
    }
    return null;
  }

  String? _validateMatricula(String? matricula) {
    if (matricula == null || matricula.trim().isEmpty) {
      return null;
    }
    if (matricula.trim().length < 5) {
      return 'La matricula debe tener al menos 5 caracteres';
    }
    if (matricula.trim().length > 20) {
      return 'La matricula no puede tener mas de 20 caracteres';
    }
    return null;
  }

  void _validatePasswordRealtime() {
    final password = _passwordController.text;

    setState(() {
      _hasMinLength = password.length >= 6;
      _hasUppercase = password.contains(RegExp(r'[A-Z]'));
      _hasLowercase = password.contains(RegExp(r'[a-z]'));
      _hasNumber = password.contains(RegExp(r'[0-9]'));

      _isPasswordValid = _hasMinLength && _hasUppercase && _hasLowercase && _hasNumber;

      _passwordsMatch = _confirmPasswordController.text == password &&
          _confirmPasswordController.text.isNotEmpty;
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _nombreController.dispose();
    _apellidoController.dispose();
    _emailController.dispose();
    _matriculaController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _nombreFocusNode.dispose();
    _apellidoFocusNode.dispose();
    _emailFocusNode.dispose();
    _matriculaFocusNode.dispose();
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    if (!_isPasswordValid) {
      _showError('La contrasena no cumple con los requisitos');
      return;
    }

    if (!_passwordsMatch) {
      _showError('Las contrasenas no coinciden');
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.register(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      nombre: _nombreController.text.trim(),
      apellido: _apellidoController.text.trim(),
      matricula: _matriculaController.text.trim().isNotEmpty
          ? _matriculaController.text.trim()
          : null,
    );

    if (!mounted) return;

    if (success) {
      _showSuccess('Cuenta creada exitosamente');

      await Future.delayed(const Duration(milliseconds: 500));

      if (!mounted) return;

      if (authProvider.isAuthenticated) {
        Navigator.pushAndRemoveUntil(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => const HomeScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 300),
          ),
              (route) => false,
        );
      } else {
        Navigator.pushAndRemoveUntil(
          context,
          PageRouteBuilder(
            pageBuilder: (context, animation, secondaryAnimation) => const LoginScreen(),
            transitionsBuilder: (context, animation, secondaryAnimation, child) {
              return FadeTransition(opacity: animation, child: child);
            },
            transitionDuration: const Duration(milliseconds: 300),
          ),
              (route) => false,
        );
      }
    } else {
      _showError(authProvider.error ?? 'Error al registrar');
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

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.white),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppTheme.secondaryColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimaryColor = isDark ? AppTheme.textPrimaryColorDark : AppTheme.textPrimaryColor;
    final textSecondaryColor = isDark ? AppTheme.textSecondaryColorDark : AppTheme.textSecondaryColor;
    final backgroundColor = isDark ? AppTheme.backgroundColorDark : AppTheme.backgroundColor;
    final surfaceColor = isDark ? AppTheme.surfaceColorDark : Colors.grey.shade100;

    return Scaffold(
      backgroundColor: backgroundColor,
      appBar: AppBar(
        title: const Text('Crear Cuenta'),
      ),
      body: SafeArea(
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Text(
                    'Completa tus datos para registrarte',
                    style: TextStyle(
                      fontSize: 16,
                      color: textSecondaryColor,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 32),

                  // Nombre
                  CustomTextField(
                    label: 'Nombre',
                    hint: 'Ingresa tu nombre',
                    controller: _nombreController,
                    focusNode: _nombreFocusNode,
                    prefixIcon: Icons.person_outline,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) {
                      FocusScope.of(context).requestFocus(_apellidoFocusNode);
                    },
                    validator: (value) => _validateName(value, 'El nombre'),
                  ),
                  const SizedBox(height: 16),

                  // Apellido
                  CustomTextField(
                    label: 'Apellido',
                    hint: 'Ingresa tu apellido',
                    controller: _apellidoController,
                    focusNode: _apellidoFocusNode,
                    prefixIcon: Icons.person_outline,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) {
                      FocusScope.of(context).requestFocus(_emailFocusNode);
                    },
                    validator: (value) => _validateName(value, 'El apellido'),
                  ),
                  const SizedBox(height: 16),

                  // Email
                  _buildEmailField(isDark, textPrimaryColor, textSecondaryColor),
                  const SizedBox(height: 16),

                  // Matricula
                  CustomTextField(
                    label: 'Matricula (opcional)',
                    hint: 'Ingresa tu matricula',
                    controller: _matriculaController,
                    focusNode: _matriculaFocusNode,
                    prefixIcon: Icons.badge_outlined,
                    textInputAction: TextInputAction.next,
                    onSubmitted: (_) {
                      FocusScope.of(context).requestFocus(_passwordFocusNode);
                    },
                    validator: _validateMatricula,
                  ),
                  const SizedBox(height: 16),

                  // Password
                  _buildPasswordField(textPrimaryColor),
                  const SizedBox(height: 8),

                  // Requisitos de contrasena
                  _buildPasswordRequirements(surfaceColor, textSecondaryColor),
                  const SizedBox(height: 16),

                  // Confirmar Password
                  _buildConfirmPasswordField(textPrimaryColor),
                  const SizedBox(height: 32),

                  // Boton de registro
                  Consumer<AuthProvider>(
                    builder: (context, auth, _) {
                      return CustomButton(
                        text: 'Registrarse',
                        onPressed: _handleRegister,
                        isLoading: auth.isLoading,
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // Link a login
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Ya tienes cuenta? ',
                        style: TextStyle(
                          color: textSecondaryColor,
                        ),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text(
                          'Inicia sesion',
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
            FocusScope.of(context).requestFocus(_matriculaFocusNode);
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
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordField(Color textPrimaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Contrasena',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: textPrimaryColor,
          ),
        ),
        const SizedBox(height: 8),
        PasswordTextField(
          controller: _passwordController,
          focusNode: _passwordFocusNode,
          hint: 'Crea una contrasena segura',
          textInputAction: TextInputAction.next,
          onSubmitted: (_) {
            FocusScope.of(context).requestFocus(_confirmPasswordFocusNode);
          },
        ),
      ],
    );
  }

  Widget _buildPasswordRequirements(Color surfaceColor, Color textSecondaryColor) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: surfaceColor,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'La contrasena debe tener:',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: textSecondaryColor,
            ),
          ),
          const SizedBox(height: 8),
          _buildRequirementRow('Minimo 6 caracteres', _hasMinLength, textSecondaryColor),
          _buildRequirementRow('Al menos una mayuscula (A-Z)', _hasUppercase, textSecondaryColor),
          _buildRequirementRow('Al menos una minuscula (a-z)', _hasLowercase, textSecondaryColor),
          _buildRequirementRow('Al menos un numero (0-9)', _hasNumber, textSecondaryColor),
        ],
      ),
    );
  }

  Widget _buildRequirementRow(String text, bool isValid, Color textSecondaryColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          Icon(
            isValid ? Icons.check_circle : Icons.circle_outlined,
            size: 16,
            color: isValid ? AppTheme.secondaryColor : textSecondaryColor,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              fontSize: 12,
              color: isValid ? AppTheme.secondaryColor : textSecondaryColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildConfirmPasswordField(Color textPrimaryColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Confirmar Contrasena',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: textPrimaryColor,
          ),
        ),
        const SizedBox(height: 8),
        PasswordTextField(
          controller: _confirmPasswordController,
          focusNode: _confirmPasswordFocusNode,
          hint: 'Repite tu contrasena',
          textInputAction: TextInputAction.done,
          onSubmitted: (_) => _handleRegister(),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Confirma tu contrasena';
            }
            if (value != _passwordController.text) {
              return 'Las contrasenas no coinciden';
            }
            return null;
          },
        ),
        if (_confirmPasswordController.text.isNotEmpty) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              Icon(
                _passwordsMatch ? Icons.check_circle : Icons.error,
                size: 16,
                color: _passwordsMatch ? AppTheme.secondaryColor : AppTheme.errorColor,
              ),
              const SizedBox(width: 8),
              Text(
                _passwordsMatch ? 'Las contrasenas coinciden' : 'Las contrasenas no coinciden',
                style: TextStyle(
                  fontSize: 12,
                  color: _passwordsMatch ? AppTheme.secondaryColor : AppTheme.errorColor,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}