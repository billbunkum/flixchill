import angular from 'angular';
import 'angular-resource';

import interestAPIService from './interest-api.service';
import omdbAPI from './interest-omdbAPI';

import interestPageComponent from './interest-page.component';

const interestModule = angular.module('interestMod', [
        'ngResource'
        ]
    )
    .config( 
        ($resourceProvider) => {
        $resourceProvider.defaults.stripTrailingSlashes = false;
        }
    )
    .factory('interestAPIService', interestAPIService)
//  does it matter if '.factory' is concatinated before '.config'??
    .factory('omdbAPI', omdbAPI)
    .component('interestPage', interestPageComponent);
//  still need to register COMPONENTS

export default interestModule;