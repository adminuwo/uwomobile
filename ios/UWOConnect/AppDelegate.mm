#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>
#import <objc/runtime.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"main";

  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@".expo/.virtual-metro-entry"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

// Linking API
- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [super application:application openURL:url options:options] || [RCTLinkingManager application:application openURL:url options:options];
}

// Universal Links
- (BOOL)application:(UIApplication *)application continueUserActivity:(nonnull NSUserActivity *)userActivity restorationHandler:(nonnull void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  BOOL result = [RCTLinkingManager application:application continueUserActivity:userActivity restorationHandler:restorationHandler];
  return [super application:application continueUserActivity:userActivity restorationHandler:restorationHandler] || result;
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  return [super application:application didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  return [super application:application didFailToRegisterForRemoteNotificationsWithError:error];
}

// Explicitly define remote notification delegates to ensure compatibility with some third-party libraries
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)userInfo fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  return [super application:application didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

#pragma mark - UISceneSession lifecycle

- (UISceneConfiguration *)application:(UIApplication *)application configurationForConnectingSceneSession:(UISceneSession *)connectingSceneSession options:(UISceneConnectionOptions *)options
{
  UISceneConfiguration *configuration = [[UISceneConfiguration alloc] initWithName:@"Default Configuration" sessionRole:connectingSceneSession.role];
  configuration.delegateClass = [SceneDelegate class];
  return configuration;
}

- (void)application:(UIApplication *)application didDiscardSceneSessions:(NSSet<UISceneSession *> *)sceneSessions
{
}

@end

#pragma mark - SceneDelegate Implementation

@implementation SceneDelegate

+ (void)load
{
  Class sceneDelegateClass = [SceneDelegate class];
  if (sceneDelegateClass) {
    Class aliasClass = objc_allocateClassPair(sceneDelegateClass, "UWOConnect.SceneDelegate", 0);
    if (aliasClass) {
      objc_registerClassPair(aliasClass);
    }
  }
}

- (void)scene:(UIScene *)scene willConnectToSession:(UISceneSession *)session options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }
  UIWindowScene *windowScene = (UIWindowScene *)scene;

  AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication] delegate];

  if (appDelegate.window) {
    appDelegate.window.windowScene = windowScene;
    self.window = appDelegate.window;
    [appDelegate.window makeKeyAndVisible];
  } else {
    self.window = [[UIWindow alloc] initWithWindowScene:windowScene];
    UIViewController *rootViewController = [appDelegate createRootViewController];
    UIView *rootView = [appDelegate.rootViewFactory viewWithModuleName:appDelegate.moduleName
                                                    initialProperties:appDelegate.initialProps
                                                        launchOptions:nil];
    [appDelegate setRootView:rootView toRootViewController:rootViewController];
    self.window.rootViewController = rootViewController;
    appDelegate.window = self.window;
    [self.window makeKeyAndVisible];
  }

  // Cold-start deep link routing via connectionOptions
  if (connectionOptions.URLContexts.count > 0) {
    for (UIOpenURLContext *urlContext in connectionOptions.URLContexts) {
      NSMutableDictionary *options = [NSMutableDictionary dictionary];
      if (urlContext.options.sourceApplication) {
        options[UIApplicationOpenURLOptionsSourceApplicationKey] = urlContext.options.sourceApplication;
      }
      if (urlContext.options.annotation) {
        options[UIApplicationOpenURLOptionsAnnotationKey] = urlContext.options.annotation;
      }
      options[UIApplicationOpenURLOptionsOpenInPlaceKey] = @(urlContext.options.openInPlace);

      [RCTLinkingManager application:[UIApplication sharedApplication] openURL:urlContext.URL options:options];
    }
  }

  // Cold-start universal link routing via connectionOptions
  if (connectionOptions.userActivities.count > 0) {
    for (NSUserActivity *activity in connectionOptions.userActivities) {
      [RCTLinkingManager application:[UIApplication sharedApplication] continueUserActivity:activity restorationHandler:^(NSArray<id<UIUserActivityRestoring>> * _Nullable restorableObjects) {}];
    }
  }
}

- (void)sceneDidDisconnect:(UIScene *)scene
{
}

- (void)sceneDidBecomeActive:(UIScene *)scene
{
}

- (void)sceneWillResignActive:(UIScene *)scene
{
}

- (void)sceneWillEnterForeground:(UIScene *)scene
{
}

- (void)sceneDidEnterBackground:(UIScene *)scene
{
}

- (void)scene:(UIScene *)scene openURLContexts:(NSSet<UIOpenURLContext *> *)URLContexts
{
  for (UIOpenURLContext *urlContext in URLContexts) {
    NSMutableDictionary *options = [NSMutableDictionary dictionary];
    if (urlContext.options.sourceApplication) {
      options[UIApplicationOpenURLOptionsSourceApplicationKey] = urlContext.options.sourceApplication;
    }
    if (urlContext.options.annotation) {
      options[UIApplicationOpenURLOptionsAnnotationKey] = urlContext.options.annotation;
    }
    options[UIApplicationOpenURLOptionsOpenInPlaceKey] = @(urlContext.options.openInPlace);

    [RCTLinkingManager application:[UIApplication sharedApplication] openURL:urlContext.URL options:options];
  }
}

- (void)scene:(UIScene *)scene continueUserActivity:(NSUserActivity *)userActivity
{
  [RCTLinkingManager application:[UIApplication sharedApplication] continueUserActivity:userActivity restorationHandler:^(NSArray<id<UIUserActivityRestoring>> * _Nullable restorableObjects) {}];
}

@end
