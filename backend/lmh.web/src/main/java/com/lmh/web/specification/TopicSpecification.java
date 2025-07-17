//package com.lmh.web.specification;
//
//import com.lmh.web.common.TypeTopic;
//import com.lmh.web.model.Language;
//import com.lmh.web.model.Topic;
//import com.lmh.web.model.User;
//import jakarta.persistence.criteria.*;
//import org.springframework.data.jpa.domain.Specification;
//
///**
// * Specification class for dynamic Topic queries using Criteria API
// */
//public class TopicSpecification {
//
//    /**
//     * Search in topic name and language name
//     */
//    public static Specification<Topic> hasSearchTerm(String search) {
//        return (root, query, criteriaBuilder) -> {
//            if (search == null || search.trim().isEmpty()) {
//                return criteriaBuilder.conjunction();
//            }
//
//            String searchPattern = "%" + search.toLowerCase() + "%";
//            Join<Topic, Language> languageJoin = root.join("language", JoinType.LEFT);
//
//            Predicate topicNamePredicate = criteriaBuilder.like(
//                    criteriaBuilder.lower(root.get("name")), searchPattern);
//            Predicate languageNamePredicate = criteriaBuilder.like(
//                    criteriaBuilder.lower(languageJoin.get("name")), searchPattern);
//
//            return criteriaBuilder.or(topicNamePredicate, languageNamePredicate);
//        };
//    }
//
//    /**
//     * Search by topic name (contains, case-insensitive)
//     */
//    public static Specification<Topic> hasName(String name) {
//        return (root, query, criteriaBuilder) -> {
//            if (name == null || name.trim().isEmpty()) {
//                return criteriaBuilder.conjunction();
//            }
//            return criteriaBuilder.like(
//                    criteriaBuilder.lower(root.get("name")),
//                    "%" + name.toLowerCase() + "%"
//            );
//        };
//    }
//
//    /**
//     * Search by language name (exact match)
//     */
//    public static Specification<Topic> hasLanguageName(String languageName) {
//        return (root, query, criteriaBuilder) -> {
//            if (languageName == null || languageName.trim().isEmpty()) {
//                return criteriaBuilder.conjunction();
//            }
//            Join<Topic, Language> languageJoin = root.join("language", JoinType.LEFT);
//            return criteriaBuilder.equal(
//                    criteriaBuilder.lower(languageJoin.get("name")),
//                    languageName.toLowerCase()
//            );
//        };
//    }
//
//    /**
//     * Search by TypeTopic enum
//     */
//    public static Specification<Topic> hasType(TypeTopic type) {
//        return (root, query, criteriaBuilder) -> {
//            if (type == null) {
//                return criteriaBuilder.conjunction();
//            }
//            return criteriaBuilder.equal(root.get("type"), type);
//        };
//    }
//
//    /**
//     * Search by delete flag
//     */
//    public static Specification<Topic> hasDeleteFlag(Boolean deleteFlag) {
//        return (root, query, criteriaBuilder) -> {
//            if (deleteFlag == null) {
//                return criteriaBuilder.conjunction();
//            }
//            return criteriaBuilder.equal(root.get("deleteFlag"), deleteFlag);
//        };
//    }
//
//    /**
//     * Filter topics for regular users (owned by user OR type = DEFAULT)
//     */
//    public static Specification<Topic> accessibleByUser(Integer userId) {
//        return (root, query, criteriaBuilder) -> {
//            Join<Topic, User> userJoin = root.join("user", JoinType.LEFT);
//
//            Predicate ownedByUser = criteriaBuilder.equal(userJoin.get("id"), userId);
//            Predicate isDefaultType = criteriaBuilder.equal(root.get("type"), TypeTopic.DEFAULT);
//
//            return criteriaBuilder.or(ownedByUser, isDefaultType);
//        };
//    }
//
//    /**
//     * Filter only non-deleted topics
//     */
//    public static Specification<Topic> notDeleted() {
//        return (root, query, criteriaBuilder) ->
//                criteriaBuilder.equal(root.get("deleteFlag"), false);
//    }
//}
