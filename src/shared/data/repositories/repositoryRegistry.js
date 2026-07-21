import {
    DATA_MODE,
    PAGE_DATA_MODE
} from "@shared/data/dataMode";

import localSiteContentRepository from "./local/siteContentRepository";
import localSiteNavigationRepository from "./local/siteNavigationRepository";
import localHomeLayoutRepository from "./local/homeLayoutRepository";
import localFooterRepository from "./local/footerRepository";
import localPageRepository from "./local/pageRepository";

import apiSiteContentRepository from "./api/siteContentRepository";
import apiSiteNavigationRepository from "./api/siteNavigationRepository";
import apiHomeLayoutRepository from "./api/homeLayoutRepository";
import apiFooterRepository from "./api/footerRepository";
import apiPageRepository from "./api/pageRepository";

const generalRepositories =
    DATA_MODE === "api"
        ? {
            siteContent:
                apiSiteContentRepository,

            siteNavigation:
                apiSiteNavigationRepository,

            homeLayout:
                apiHomeLayoutRepository,

            footer:
                apiFooterRepository
        }
        : {
            siteContent:
                localSiteContentRepository,

            siteNavigation:
                localSiteNavigationRepository,

            homeLayout:
                localHomeLayoutRepository,

            footer:
                localFooterRepository
        };

const pageRepository =
    PAGE_DATA_MODE === "api"
        ? apiPageRepository
        : localPageRepository;

export const dataRepositories =
    Object.freeze({
        ...generalRepositories,

        pages:
            pageRepository
    });

export function getSiteContentRepository() {
    return dataRepositories
        .siteContent;
}

export function getSiteNavigationRepository() {
    return dataRepositories
        .siteNavigation;
}

export function getHomeLayoutRepository() {
    return dataRepositories
        .homeLayout;
}

export function getFooterRepository() {
    return dataRepositories
        .footer;
}

export function getPageRepository() {
    return dataRepositories
        .pages;
}

export function getRepositoryStatus() {
    return {
        mode:
            DATA_MODE,

        pageMode:
            PAGE_DATA_MODE,

        repositories:
            Object.entries(
                dataRepositories
            ).map(
                ([
                    name,
                    repository
                ]) => ({
                    name,

                    mode:
                        repository.mode
                })
            )
    };
}