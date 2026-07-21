import {
    DATA_MODE
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

const localRepositories = {
    siteContent:
        localSiteContentRepository,

    siteNavigation:
        localSiteNavigationRepository,

    homeLayout:
        localHomeLayoutRepository,

    footer:
        localFooterRepository,

    pages:
        localPageRepository
};

const apiRepositories = {
    siteContent:
        apiSiteContentRepository,

    siteNavigation:
        apiSiteNavigationRepository,

    homeLayout:
        apiHomeLayoutRepository,

    footer:
        apiFooterRepository,

    pages:
        apiPageRepository
};

export const dataRepositories =
    Object.freeze(
        DATA_MODE === "api"
            ? apiRepositories
            : localRepositories
    );

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