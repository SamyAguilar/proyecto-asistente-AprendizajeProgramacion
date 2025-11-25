// lib/screens/profile/profile_screen.dart

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../config/theme.dart';
import '../../widgets/custom_button.dart';
import '../../widgets/loading_widget.dart';
import '../auth/login_screen.dart';
import 'edit_profile_screen.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  void _handleLogout(BuildContext context) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cerrar sesion'),
        content: const Text('Estas seguro que deseas cerrar sesion?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text(
              'Cerrar sesion',
              style: TextStyle(color: AppTheme.errorColor),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && context.mounted) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();

      if (context.mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const LoginScreen()),
              (route) => false,
        );
      }
    }
  }

  void _navigateToEdit(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => const EditProfileScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Mi Perfil'),
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () => _navigateToEdit(context),
          ),
        ],
      ),
      body: Consumer<AuthProvider>(
        builder: (context, auth, _) {
          if (auth.isLoading) {
            return const LoadingWidget(message: 'Cargando perfil...');
          }

          final usuario = auth.usuario;
          if (usuario == null) {
            return const Center(
              child: Text('No se pudo cargar el perfil'),
            );
          }

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Column(
              children: [
                // Avatar
                Center(
                  child: Stack(
                    children: [
                      CircleAvatar(
                        radius: 60,
                        backgroundColor: AppTheme.primaryColor,
                        backgroundImage: usuario.fotoPerfil != null &&
                            usuario.fotoPerfil!.isNotEmpty
                            ? NetworkImage(usuario.fotoPerfil!)
                            : null,
                        child: usuario.fotoPerfil == null ||
                            usuario.fotoPerfil!.isEmpty
                            ? Text(
                          usuario.iniciales,
                          style: const TextStyle(
                            fontSize: 36,
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
                          decoration: BoxDecoration(
                            color: AppTheme.secondaryColor,
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: Colors.white,
                              width: 2,
                            ),
                          ),
                          child: Icon(
                            _getRoleIcon(usuario.rol),
                            size: 20,
                            color: Colors.white,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Nombre
                Text(
                  usuario.nombreCompleto,
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 4),

                // Rol
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _getRoleName(usuario.rol),
                    style: const TextStyle(
                      color: AppTheme.primaryColor,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
                const SizedBox(height: 32),

                // Informacion
                _buildInfoCard(context, usuario),
                const SizedBox(height: 24),

                // Boton editar
                CustomButton(
                  text: 'Editar Perfil',
                  onPressed: () => _navigateToEdit(context),
                  isOutlined: true,
                  icon: Icons.edit,
                ),
                const SizedBox(height: 16),

                // Boton cerrar sesion
                CustomButton(
                  text: 'Cerrar Sesion',
                  onPressed: () => _handleLogout(context),
                  backgroundColor: AppTheme.errorColor,
                  icon: Icons.logout,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildInfoCard(BuildContext context, dynamic usuario) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            _buildInfoRow(
              icon: Icons.email_outlined,
              label: 'Correo electronico',
              value: usuario.email,
            ),
            const Divider(height: 24),
            _buildInfoRow(
              icon: Icons.badge_outlined,
              label: 'Matricula',
              value: usuario.matricula ?? 'No registrada',
            ),
            const Divider(height: 24),
            _buildInfoRow(
              icon: Icons.verified_user_outlined,
              label: 'Estado',
              value: usuario.estado ?? 'Activo',
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(
          icon,
          color: AppTheme.primaryColor,
          size: 24,
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textSecondaryColor,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  IconData _getRoleIcon(String rol) {
    switch (rol) {
      case 'admin':
        return Icons.admin_panel_settings;
      case 'profesor':
        return Icons.school;
      default:
        return Icons.person;
    }
  }

  String _getRoleName(String rol) {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'profesor':
        return 'Profesor';
      default:
        return 'Estudiante';
    }
  }
}