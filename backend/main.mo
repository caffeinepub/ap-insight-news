import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type NewsCategory = {
    #political;
    #movie;
  };

  public type News = {
    id : Text;
    title : Text;
    summary : Text;
    fullContent : Text;
    category : NewsCategory;
    author : Text;
    publicationDate : Text;
    imageUrl : ?Text;
    expiresAt : Time.Time;
  };

  public type Review = {
    id : Nat;
    articleId : Text;
    reviewerName : Text;
    rating : Nat;
    reviewText : Text;
    createdAt : Time.Time;
  };

  public type UserProfile = {
    name : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let news = Map.empty<Text, News>();
  let reviews = Map.empty<Nat, Review>();
  var nextReviewId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addNews(id : Text, title : Text, summary : Text, fullContent : Text, category : NewsCategory, author : Text, publicationDate : Text, imageUrl : ?Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add news articles");
    };

    let article : News = {
      id;
      title;
      summary;
      fullContent;
      category;
      author;
      publicationDate;
      imageUrl;
      expiresAt = Time.now() + (7 * 24 * 60 * 60 * 1000000000); // 7 days in nanoseconds
    };

    news.add(id, article);
  };

  public query func getNewsById(id : Text) : async News {
    switch (news.get(id)) {
      case (null) { Runtime.trap("Article not found.") };
      case (?article) {
        if (Time.now() > article.expiresAt) {
          Runtime.trap("Article has expired");
        };
        article;
      };
    };
  };

  public query func getAllNews() : async [News] {
    news.values().toArray().filter(
      func(article) {
        Time.now() <= article.expiresAt;
      }
    );
  };

  public query func getNewsByCategory(category : NewsCategory) : async [News] {
    news.values().toArray().filter(
      func(article) {
        article.category == category and Time.now() <= article.expiresAt
      }
    );
  };

  public shared ({ caller }) func addReview(articleId : Text, reviewerName : Text, rating : Nat, reviewText : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add reviews");
    };

    if (rating < 1 or rating > 5) {
      Runtime.trap("Rating must be between 1 and 5");
    };

    switch (news.get(articleId)) {
      case (null) {
        Runtime.trap("Article does not exist");
      };
      case (?article) {
        if (Time.now() > article.expiresAt) {
          Runtime.trap("Cannot review expired article");
        };
      };
    };

    let review : Review = {
      id = nextReviewId;
      articleId;
      reviewerName;
      rating;
      reviewText;
      createdAt = Time.now();
    };

    reviews.add(nextReviewId, review);
    let id = nextReviewId;
    nextReviewId += 1;
    id;
  };

  public shared ({ caller }) func deleteNews(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete news articles");
    };

    switch (news.get(id)) {
      case (null) {
        Runtime.trap("News article not found");
      };
      case (?_news) {
        news.remove(id);
      };
    };
  };

  public query func getReviewsByArticleId(articleId : Text) : async [Review] {
    reviews.values().toArray().filter(
      func(review) {
        review.articleId == articleId;
      }
    );
  };

  public query func getAllReviews() : async [Review] {
    reviews.values().toArray();
  };

  public shared ({ caller }) func deleteReview(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete reviews");
    };

    switch (reviews.get(id)) {
      case (null) {
        Runtime.trap("Review not found");
      };
      case (?_review) {
        reviews.remove(id);
      };
    };
  };

  public shared ({ caller }) func purgeExpiredArticles() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can purge expired articles");
    };

    let currentTime = Time.now();

    let expiredIds = news.toArray().filter(
      func((id, article)) {
        currentTime > article.expiresAt;
      }
    );

    for ((id, _) in expiredIds.values()) {
      news.remove(id);
    };
  };
};
