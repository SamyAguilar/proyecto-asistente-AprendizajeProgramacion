// lib/services/http_service.dart

import 'package:dio/dio.dart';
import '../config/constants.dart';
import 'storage_service.dart';

class HttpService {
  static final HttpService _instance = HttpService._internal();
  factory HttpService() => _instance;
  
  late final Dio _dio;
  final _storage = StorageService();

  HttpService._internal() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConstants.apiUrl,
        connectTimeout: Duration(seconds: AppConstants.connectionTimeout),
        receiveTimeout: Duration(seconds: AppConstants.receiveTimeout),
        sendTimeout: Duration(seconds: AppConstants.sendTimeout),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.add(_AuthInterceptor(_storage));
  }

  Dio get dio => _dio;

  // ============================================
  // METODOS HTTP
  // ============================================

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.get(
        path,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.post(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.put(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<Response> delete(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      return await _dio.delete(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // ============================================
  // MANEJO DE ERRORES
  // ============================================

  HttpException _handleError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        return HttpException(
          message: AppConstants.errorConexion,
          statusCode: 0,
        );

      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode ?? 0;
        final message = _extractErrorMessage(error.response);

        if (statusCode == 401) {
          return HttpException(
            message: AppConstants.errorAutenticacion,
            statusCode: 401,
          );
        }

        if (statusCode >= 500) {
          return HttpException(
            message: AppConstants.errorServidor,
            statusCode: statusCode,
          );
        }

        return HttpException(
          message: message ?? AppConstants.errorGenerico,
          statusCode: statusCode,
        );

      case DioExceptionType.cancel:
        return HttpException(
          message: 'Peticion cancelada',
          statusCode: 0,
        );

      default:
        return HttpException(
          message: error.message ?? AppConstants.errorGenerico,
          statusCode: 0,
        );
    }
  }

  String? _extractErrorMessage(Response? response) {
    if (response?.data is Map) {
      return response?.data['error'] ?? 
             response?.data['mensaje'] ?? 
             response?.data['message'];
    }
    return null;
  }
}

// ============================================
// INTERCEPTOR DE AUTENTICACION
// ============================================

class _AuthInterceptor extends Interceptor {
  final StorageService _storage;

  _AuthInterceptor(this._storage);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.getAccessToken();

    if (token != null && token.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $token';
    }

    return handler.next(options);
  }

  @override
  void onResponse(
    Response response,
    ResponseInterceptorHandler handler,
  ) {
    return handler.next(response);
  }

  @override
  void onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      try {
        final newAccessToken = await _refreshToken();
        
        if (newAccessToken != null) {
          await _storage.saveAccessToken(newAccessToken);
          
          final options = err.requestOptions;
          options.headers['Authorization'] = 'Bearer $newAccessToken';
          
          final dio = Dio();
          final response = await dio.fetch(options);
          
          return handler.resolve(response);
        }
      } catch (e) {
        await _storage.clearSession();
      }
    }

    return handler.next(err);
  }

  Future<String?> _refreshToken() async {
    try {
      final refreshToken = await _storage.getRefreshToken();
      
      if (refreshToken == null) {
        return null;
      }

      final dio = Dio(BaseOptions(baseUrl: AppConstants.baseUrl));
      final response = await dio.post(
        AppConstants.refreshTokenUrl,
        data: {'refreshToken': refreshToken},
      );

      if (response.statusCode == 200 && response.data['accessToken'] != null) {
        return response.data['accessToken'] as String;
      }

      return null;
    } catch (e) {
      return null;
    }
  }
}

// ============================================
// EXCEPCION HTTP
// ============================================

class HttpException implements Exception {
  final String message;
  final int statusCode;

  HttpException({
    required this.message,
    required this.statusCode,
  });

  @override
  String toString() => message;
}