// lib/widgets/custom_text_field.dart

import 'package:flutter/material.dart';
import '../config/theme.dart';

class CustomTextField extends StatefulWidget {
  final String label;
  final String? hint;
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final TextInputType keyboardType;
  final bool obscureText;
  final bool enabled;
  final int maxLines;
  final int? maxLength;
  final IconData? prefixIcon;
  final Widget? suffixIcon;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;
  final bool autofocus;

  const CustomTextField({
    super.key,
    required this.label,
    this.hint,
    this.controller,
    this.validator,
    this.keyboardType = TextInputType.text,
    this.obscureText = false,
    this.enabled = true,
    this.maxLines = 1,
    this.maxLength,
    this.prefixIcon,
    this.suffixIcon,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction,
    this.focusNode,
    this.autofocus = false,
  });

  @override
  State<CustomTextField> createState() => _CustomTextFieldState();
}

class _CustomTextFieldState extends State<CustomTextField> {
  late bool _obscureText;

  @override
  void initState() {
    super.initState();
    _obscureText = widget.obscureText;
  }

  @override
  Widget build(BuildContext context) {
    // Detectar modo oscuro
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimaryColor = isDark ? AppTheme.textPrimaryColorDark : AppTheme.textPrimaryColor;
    final textSecondaryColor = isDark ? AppTheme.textSecondaryColorDark : AppTheme.textSecondaryColor;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: textPrimaryColor,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: widget.controller,
          validator: widget.validator,
          keyboardType: widget.keyboardType,
          obscureText: _obscureText,
          enabled: widget.enabled,
          maxLines: widget.obscureText ? 1 : widget.maxLines,
          maxLength: widget.maxLength,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          textInputAction: widget.textInputAction,
          focusNode: widget.focusNode,
          autofocus: widget.autofocus,
          style: TextStyle(
            fontSize: 16,
            color: textPrimaryColor,
          ),
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: TextStyle(
              color: textSecondaryColor,
            ),
            prefixIcon: widget.prefixIcon != null
                ? Icon(
              widget.prefixIcon,
              color: textSecondaryColor,
              size: 22,
            )
                : null,
            suffixIcon: widget.obscureText
                ? IconButton(
              icon: Icon(
                _obscureText ? Icons.visibility_off : Icons.visibility,
                color: textSecondaryColor,
              ),
              onPressed: () {
                setState(() {
                  _obscureText = !_obscureText;
                });
              },
            )
                : widget.suffixIcon,
          ),
        ),
      ],
    );
  }
}

// ============================================
// CAMPO DE EMAIL
// ============================================

class EmailTextField extends StatelessWidget {
  final TextEditingController? controller;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;

  const EmailTextField({
    super.key,
    this.controller,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction,
    this.focusNode,
  });

  @override
  Widget build(BuildContext context) {
    return CustomTextField(
      label: 'Correo electronico',
      hint: 'ejemplo@correo.com',
      controller: controller,
      keyboardType: TextInputType.emailAddress,
      prefixIcon: Icons.email_outlined,
      textInputAction: textInputAction ?? TextInputAction.next,
      focusNode: focusNode,
      onChanged: onChanged,
      onSubmitted: onSubmitted,
      validator: validator ?? (value) {
        if (value == null || value.isEmpty) {
          return 'El correo es requerido';
        }
        if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
          return 'Ingresa un correo valido';
        }
        return null;
      },
    );
  }
}

// ============================================
// CAMPO DE PASSWORD
// ============================================

class PasswordTextField extends StatefulWidget {
  final TextEditingController? controller;
  final String? label;
  final String? hint;
  final String? Function(String?)? validator;
  final void Function(String)? onChanged;
  final void Function(String)? onSubmitted;
  final TextInputAction? textInputAction;
  final FocusNode? focusNode;

  const PasswordTextField({
    super.key,
    this.controller,
    this.label,
    this.hint,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.textInputAction,
    this.focusNode,
  });

  @override
  State<PasswordTextField> createState() => _PasswordTextFieldState();
}

class _PasswordTextFieldState extends State<PasswordTextField> {
  bool _obscureText = true;

  @override
  Widget build(BuildContext context) {
    // Detectar modo oscuro
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textPrimaryColor = isDark ? AppTheme.textPrimaryColorDark : AppTheme.textPrimaryColor;
    final textSecondaryColor = isDark ? AppTheme.textSecondaryColorDark : AppTheme.textSecondaryColor;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: textPrimaryColor,
            ),
          ),
          const SizedBox(height: 8),
        ],
        TextFormField(
          controller: widget.controller,
          obscureText: _obscureText,
          focusNode: widget.focusNode,
          textInputAction: widget.textInputAction ?? TextInputAction.done,
          onChanged: widget.onChanged,
          onFieldSubmitted: widget.onSubmitted,
          style: TextStyle(
            fontSize: 16,
            color: textPrimaryColor,
          ),
          validator: widget.validator ?? (value) {
            if (value == null || value.isEmpty) {
              return 'La contrasena es requerida';
            }
            if (value.length < 6) {
              return 'La contrasena debe tener al menos 6 caracteres';
            }
            return null;
          },
          decoration: InputDecoration(
            hintText: widget.hint ?? 'Ingresa tu contrasena',
            hintStyle: TextStyle(
              color: textSecondaryColor,
            ),
            prefixIcon: Icon(
              Icons.lock_outline,
              color: textSecondaryColor,
              size: 22,
            ),
            suffixIcon: IconButton(
              icon: Icon(
                _obscureText ? Icons.visibility_off : Icons.visibility,
                color: textSecondaryColor,
              ),
              onPressed: () {
                setState(() {
                  _obscureText = !_obscureText;
                });
              },
            ),
          ),
        ),
      ],
    );
  }
}