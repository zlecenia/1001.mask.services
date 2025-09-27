1001.mask.services$ tree -I 'node_modules'
.
├── 7.9-display-validation.html
├── backends.md
├── backups
│   ├── backup-20250926-201225
│   │   ├── backup-metadata.json
│   │   ├── BACKUP-README.md
│   │   ├── dist
│   │   │   ├── assets
│   │   │   │   ├── index-b505be6d.css
│   │   │   │   ├── main-9ee5c8fd.js
│   │   │   │   └── main-9ee5c8fd.js.map
│   │   │   └── index.html
│   │   ├── docs
│   │   │   ├── api-documentation.md
│   │   │   ├── device-data-modules.md
│   │   │   ├── modules-documentation.md
│   │   │   ├── README.md
│   │   │   ├── ROLE-ACCESS-SYSTEM.md
│   │   │   └── VUE_MIGRATION_DOCUMENTATION.md
│   │   ├── index.html
│   │   ├── js
│   │   │   ├── FeatureRegistry.js
│   │   │   ├── features
│   │   │   │   ├── appFooter
│   │   │   │   │   └── 0.1.0
│   │   │   │   │       ├── appFooter.js
│   │   │   │   │       ├── appFooter.test.js
│   │   │   │   │       ├── CHANGELOG.md
│   │   │   │   │       ├── config.json
│   │   │   │   │       ├── index.js
│   │   │   │   │       ├── package.json
│   │   │   │   │       ├── README.md
│   │   │   │   │       └── TODO.md
│   │   │   │   ├── appHeader
│   │   │   │   │   └── 0.1.0
│   │   │   │   │       ├── appHeader.js
│   │   │   │   │       ├── appHeader.test.js
│   │   │   │   │       ├── CHANGELOG.md
│   │   │   │   │       ├── config.json
│   │   │   │   │       ├── index.js
│   │   │   │   │       ├── package.json
│   │   │   │   │       ├── README.md
│   │   │   │   │       └── TODO.md
│   │   │   │   ├── auditLogViewer
│   │   │   │   │   └── 0.1.0
│   │   │   │   │       ├── auditLogViewer.integration.test.js
│   │   │   │   │       ├── auditLogViewer.js
│   │   │   │   │       ├── auditLogViewer.test.js
│   │   │   │   │       ├── CHANGELOG.md
│   │   │   │   │       ├── config.json
│   │   │   │   │       ├── index.js
│   │   │   │   │       ├── README.md
│   │   │   │   │       └── TODO.md
│   │   │   │   ├── loginForm
│   │   │   │   │   └── 0.1.0
│   │   │   │   │       ├── CHANGELOG.md
│   │   │   │   │       ├── config.json
│   │   │   │   │       ├── index.js
│   │   │   │   │       ├── loginForm.js
│   │   │   │   │       ├── loginForm.test.js
│   │   │   │   │       ├── package.json
│   │   │   │   │       ├── README.md
│   │   │   │   │       └── TODO.md
│   │   │   │   ├── mainMenu
│   │   │   │   │   └── 0.1.0
│   │   │   │   │       ├── CHANGELOG.md
│   │   │   │   │       ├── config.json
│   │   │   │   │       ├── index.js
│   │   │   │   │       ├── mainMenu.js
│   │   │   │   │       ├── mainMenu.test.js
│   │   │   │   │       ├── package.json
│   │   │   │   │       ├── README.md
│   │   │   │   │       └── TODO.md
│   │   │   │   ├── pageTemplate
│   │   │   │   │   └── 0.1.0
│   │   │   │   │       ├── CHANGELOG.md
│   │   │   │   │       ├── config.json
│   │   │   │   │       ├── index.js
│   │   │   │   │       ├── package.json
│   │   │   │   │       ├── pageTemplate.js
│   │   │   │   │       ├── pageTemplate.test.js
│   │   │   │   │       ├── README.md
│   │   │   │   │       └── TODO.md
│   │   │   │   └── pressurePanel
│   │   │   │       └── 0.1.0
│   │   │   │           ├── CHANGELOG.md
│   │   │   │           ├── config.json
│   │   │   │           ├── index.js
│   │   │   │           ├── package.json
│   │   │   │           ├── pressurePanel.js
│   │   │   │           ├── pressurePanel.test.js
│   │   │   │           ├── README.md
│   │   │   │           └── TODO.md
│   │   │   ├── initializeI18n.js
│   │   │   ├── main.js
│   │   │   ├── moduleManagerWithPackageJson.js
│   │   │   ├── OptimizedFeatureRegistry.js
│   │   │   ├── registerAllModulesBrowser.js
│   │   │   ├── registerAllModules.js
│   │   │   ├── services
│   │   │   │   ├── i18nService.js
│   │   │   │   ├── performanceService.js
│   │   │   │   ├── securityService.js
│   │   │   │   └── websocketService.js
│   │   │   ├── store
│   │   │   │   ├── index.js
│   │   │   │   └── modules
│   │   │   │       ├── auth.js
│   │   │   │       ├── navigation.js
│   │   │   │       ├── sensors.js
│   │   │   │       └── system.js
│   │   │   └── test-setup.js
│   │   ├── Makefile
│   │   ├── module-analysis-results.json
│   │   ├── module-test-results.json
│   │   ├── package.json
│   │   ├── package-lock.json
│   │   ├── README.md
│   │   ├── scripts
│   │   │   ├── analyze-modules.py
│   │   │   ├── backup.sh
│   │   │   ├── deploy.sh
│   │   │   ├── generate-docs.sh
│   │   │   ├── prepare-production.sh
│   │   │   ├── restore.sh
│   │   │   ├── show-logs.sh
│   │   │   ├── test-modules.sh
│   │   │   ├── test-single-module.sh
│   │   │   └── validate-structure.sh
│   │   ├── test-results.json
│   │   └── vite.config.js
│   └── backup-20250926-203426
│       ├── assets
│       │   ├── index-0b694967.js
│       │   ├── index-0b694967.js.map
│       │   ├── index-0c0c5c03.js
│       │   ├── index-0c0c5c03.js.map
│       │   ├── index-21eab7da.js
│       │   ├── index-21eab7da.js.map
│       │   ├── index-38f6ffa7.css
│       │   ├── index-5947547a.js
│       │   ├── index-5947547a.js.map
│       │   ├── index-803f0a79.js
│       │   ├── index-803f0a79.js.map
│       │   ├── index-8944d598.js
│       │   ├── index-8944d598.js.map
│       │   ├── index-d679cc3f.js
│       │   ├── index-d679cc3f.js.map
│       │   ├── main-ed6223a2.js
│       │   └── main-ed6223a2.js.map
│       ├── build-info.json
│       └── index.html
├── CNAME
├── components2.md
├── components.md
├── config
│   ├── app
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── app.json
│   ├── menu
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── menu.json
│   ├── project_structure.md
│   ├── README.md
│   ├── router
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── router.json
│   ├── routing.json
│   ├── schema_integration_example.js
│   ├── sensors.json
│   ├── system
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── system.json
│   ├── test-scenarios
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   ├── test-scenarios.json
│   ├── workshop
│   │   ├── crud.json
│   │   ├── data.json
│   │   └── schema.json
│   └── workshop.json
├── configs
│   ├── _backups
│   ├── _generated
│   ├── _schemas
│   └── _templates
├── css
│   ├── lcd-optimization.css
│   ├── style.css
│   ├── vue-app.css
│   └── vue.css
├── deployed
│   ├── assets
│   │   ├── index-0c0c5c03.js
│   │   ├── index-0c0c5c03.js.map
│   │   ├── index-38f6ffa7.css
│   │   ├── index-3dcff014.js
│   │   ├── index-3dcff014.js.map
│   │   ├── index-4f92c590.js
│   │   ├── index-4f92c590.js.map
│   │   ├── index-7794ffa5.js
│   │   ├── index-7794ffa5.js.map
│   │   ├── index-7ec0724b.js
│   │   ├── index-7ec0724b.js.map
│   │   ├── index-b6163615.js
│   │   ├── index-b6163615.js.map
│   │   ├── index-cb464549.js
│   │   ├── index-cb464549.js.map
│   │   ├── index-d679cc3f.js
│   │   ├── index-d679cc3f.js.map
│   │   ├── main-046eb066.js
│   │   └── main-046eb066.js.map
│   ├── build-info.json
│   └── index.html
├── deploy-info-production.json
├── DEPLOYMENT-SUMMARY.md
├── dist
│   ├── assets
│   │   ├── index-0c0c5c03.js
│   │   ├── index-0c0c5c03.js.map
│   │   ├── index-38f6ffa7.css
│   │   ├── index-3dcff014.js
│   │   ├── index-3dcff014.js.map
│   │   ├── index-4f92c590.js
│   │   ├── index-4f92c590.js.map
│   │   ├── index-7794ffa5.js
│   │   ├── index-7794ffa5.js.map
│   │   ├── index-7ec0724b.js
│   │   ├── index-7ec0724b.js.map
│   │   ├── index-b6163615.js
│   │   ├── index-b6163615.js.map
│   │   ├── index-cb464549.js
│   │   ├── index-cb464549.js.map
│   │   ├── index-d679cc3f.js
│   │   ├── index-d679cc3f.js.map
│   │   ├── main-046eb066.js
│   │   └── main-046eb066.js.map
│   ├── build-info.json
│   └── index.html
├── docs
│   ├── api-documentation.md
│   ├── device-data-modules.md
│   ├── modules-documentation.md
│   ├── README.md
│   ├── ROLE-ACCESS-SYSTEM.md
│   └── VUE_MIGRATION_DOCUMENTATION.md
├── favicon.ico
├── index.html
├── js
│   ├── FeatureRegistry.js
│   ├── features
│   │   ├── appFooter
│   │   │   └── 0.1.0
│   │   │       ├── appFooter.js
│   │   │       ├── appFooter.test.js
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── package.json
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── appHeader
│   │   │   └── 0.1.0
│   │   │       ├── appHeader.js
│   │   │       ├── appHeader.test.js
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── package.json
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── auditLogViewer
│   │   │   └── 0.1.0
│   │   │       ├── auditLogViewer.integration.test.js
│   │   │       ├── auditLogViewer.js
│   │   │       ├── auditLogViewer.test.js
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── deviceData
│   │   │   └── 0.1.0
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── deviceData.js
│   │   │       ├── deviceData.test.js
│   │   │       ├── index.js
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── loginForm
│   │   │   └── 0.1.0
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── loginForm.js
│   │   │       ├── loginForm.test.js
│   │   │       ├── package.json
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── mainMenu
│   │   │   └── 0.1.0
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── mainMenu.js
│   │   │       ├── mainMenu.test.js
│   │   │       ├── package.json
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── pageTemplate
│   │   │   └── 0.1.0
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── package.json
│   │   │       ├── pageTemplate.js
│   │   │       ├── pageTemplate.test.js
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── pressurePanel
│   │   │   └── 0.1.0
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── package.json
│   │   │       ├── pressurePanel.js
│   │   │       ├── pressurePanel.test.js
│   │   │       ├── README.md
│   │   │       └── TODO.md
│   │   ├── realtimeSensors
│   │   │   └── 0.1.0
│   │   │       ├── CHANGELOG.md
│   │   │       ├── config.json
│   │   │       ├── index.js
│   │   │       ├── README.md
│   │   │       ├── realtimeSensors.js
│   │   │       ├── realtimeSensors.test.js
│   │   │       └── TODO.md
│   │   └── systemSettings
│   │       └── 0.1.0
│   │           ├── CHANGELOG.md
│   │           ├── config.json
│   │           ├── index.js
│   │           ├── README.md
│   │           ├── systemSettings.js
│   │           ├── systemSettings.test.js
│   │           └── TODO.md
│   ├── initializeI18n.js
│   ├── main.js
│   ├── moduleManagerWithPackageJson.js
│   ├── OptimizedFeatureRegistry.js
│   ├── registerAllModulesBrowser.js
│   ├── registerAllModules.js
│   ├── services
│   │   ├── i18nService.js
│   │   ├── performanceService.js
│   │   ├── securityService.js
│   │   └── websocketService.js
│   ├── store
│   │   ├── index.js
│   │   └── modules
│   │       ├── auth.js
│   │       ├── navigation.js
│   │       ├── sensors.js
│   │       └── system.js
│   └── test-setup.js
├── locales
│   ├── de.json
│   ├── en.json
│   └── pl.json
├── Makefile
├── migration.md
├── module-analysis-results.json
├── modules
├── module-test-results.json
├── package.json
├── package-lock.json
├── README.md
├── scripts
│   ├── analyze-modules.py
│   ├── backup.sh
│   ├── deploy.sh
│   ├── generate-docs.sh
│   ├── prepare-production.sh
│   ├── restore.sh
│   ├── show-logs.sh
│   ├── test-modules.sh
│   ├── test-single-module.sh
│   └── validate-structure.sh
├── SDK_IMPLEMENTATION_SUMMARY.md
├── test-7.9-display-responsiveness.js
├── test-results.json
├── todo.md
├── tools
│   ├── backup.js
│   ├── clean.js
│   ├── generators
│   │   ├── crudGenerator.js
│   │   ├── goSDKTemplate.go
│   │   ├── pythonSDKTemplate.py
│   │   ├── schemaGenerator.js
│   │   └── sdkGenerator.js
│   ├── init
│   │   ├── initAll.js
│   │   ├── initComponent.js
│   │   └── listModules.js
│   ├── sync
│   │   ├── syncConfigs.js
│   │   └── watchConfigs.js
│   └── validators
│       ├── configValidator.js
│       ├── crudValidator.js
│       └── schemaValidator.js
├── tree.md
├── vite.config.js
└── vitest.config.js