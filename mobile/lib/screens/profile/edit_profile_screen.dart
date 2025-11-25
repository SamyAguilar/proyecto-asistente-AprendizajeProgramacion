// lib/screens/profile/edit_profile_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/custom_text_field.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nombreController = TextEditingController();
  final _apellidoController = TextEditingController();
  final _fotoPerfilController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  void _loadUserData() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final usuario = authProvider.usuario;

    if (usuario != null) {
      _nombreController.text = usuario.nombre;
      _apellidoController.text = usuario.apellido;
      _fotoPerfilController.text = usuario.fotoPerfil ?? '';
    }
  }

  @override
  void dispose() {
    _nombreController.dispose();
    _apellidoController.dispose();
    _fotoPerfilController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    final success = await authProvider.updateProfile(
      nombre: _nombreController.text.trim(),
      apellido: _apellidoController.text.trim(),
      fotoPerfil: _fotoPerfilController.text.trim().isNotEmpty
          ? _fotoPerfilController.text.trim()
          : null,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Perfil actualizado correctamente'),
          backgroundColor: AppTheme.secondaryColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authProvider.error ?? 'Error al actualizar perfil'),
          backgroundColor: AppTheme.errorColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Editar Perfil'),
      ),
      body: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Avatar preview
                  Center(
                    child: Stack(
                      children: [
                        CircleAvatar(
                          radius: 50,
                          backgroundColor: AppTheme.primaryColor,
                          backgroundImage: _fotoPerfilController.text.isNotEmpty
                              ? NetworkImage(_fotoPerfilController.text)
                              : null,
                          child: _fotoPerfilController.text.isEmpty
                              ? Text(
                            auth.usuario?.iniciales ?? '',
                            style: const TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          )
                              : null,
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: const BoxDecoration(
                              color: AppTheme.primaryColor,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.camera_alt,
                              size: 20,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Nota sobre campos no editables
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: Colors.blue.shade700,
                          size: 20,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'El correo electronico y la contrasena no se pueden cambiar desde aqui.',
                            style: TextStyle(
                              fontSize: 13,
                              color: Colors.blue.shade700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Nombre
                  CustomTextField(
                    label: 'Nombre',
                    hint: 'Ingresa tu nombre',
                    controller: _nombreController,
                    prefixIcon: Icons.person_outline,
                    textInputAction: TextInputAction.next,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'El nombre es requerido';
                      }
                      if (value.length < 2) {
                        return 'El nombre debe tener al menos 2 caracteres';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Apellido
                  CustomTextField(
                    label: 'Apellido',
                    hint: 'Ingresa tu apellido',
                    controller: _apellidoController,
                    prefixIcon: Icons.person_outline,
                    textInputAction: TextInputAction.next,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'El apellido es requerido';
                      }
                      if (value.length < 2) {
                        return 'El apellido debe tener al menos 2 caracteres';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // URL de foto de perfil
                  CustomTextField(
                    label: 'URL de foto de perfil (opcional)',
                    hint: 'https://ejemplo.com/foto.jpg',
                    controller: _fotoPerfilController,
                    prefixIcon: Icons.image_outlined,
                    keyboardType: TextInputType.url,
                    textInputAction: TextInputAction.done,
                    onChanged: (value) {
                      setState(() {});
                    },
                    validator: (value) {
                      if (value != null && value.isNotEmpty) {
                        if (!value.startsWith('http://') &&
                            !value.startsWith('https://')) {
                          return 'La URL debe empezar con http:// o https://';
                        }
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 32),

                  // Boton guardar
                  CustomButton(
                    text: 'Guardar Cambios',
                    onPressed: _handleSave,
                    isLoading: auth.isLoading,
                    icon: Icons.save,
                  ),
                  const SizedBox(height: 16),

                  // Boton cancelar
                  CustomButton(
                    text: 'Cancelar',
                    onPressed: () => Navigator.pop(context),
                    isOutlined: true,
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}