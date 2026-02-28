import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import OutCall "http-outcalls/outcall";
import Set "mo:core/Set";
import Migration "migration";

(with migration = Migration.run)
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
    imageData : ?Text;
    expiresAt : Time.Time;
    createdAt : Time.Time;
    sourceUrl : Text;
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

  public type LiveStatus = {
    isLive : Bool;
    startedAt : ?Time.Time;
  };

  public type NewsItemDTO = {
    title : Text;
    summary : Text;
    content : Text;
    author : Text;
    category : Text;
    publicationDate : Text;
    sourceUrl : Text;
  };

  public type NewsSource = {
    name : Text;
    baseUrl : Text;
    feedUrl : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let news = Map.empty<Text, News>();
  let reviews = Map.empty<Nat, Review>();
  var nextReviewId = 0;
  let userProfiles = Map.empty<Principal, UserProfile>();
  var liveStatus : LiveStatus = {
    isLive = false;
    startedAt = null;
  };
  let processedUrls = Set.empty<Text>();
  let newsSources = Map.empty<Text, NewsSource>();

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

  public query ({ caller }) func isConnected() : async Bool {
    true;
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addNews(
    id : Text,
    title : Text,
    summary : Text,
    fullContent : Text,
    category : NewsCategory,
    author : Text,
    publicationDate : Text,
    imageData : ?Text,
    sourceUrl : Text,
  ) : async () {
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
      imageData;
      expiresAt = Time.now() + (7 * 24 * 60 * 60 * 1000000000);
      createdAt = Time.now();
      sourceUrl;
    };

    news.add(id, article);
  };

  public shared ({ caller }) func addBulkNews(newsItems : [NewsItemDTO]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add news articles");
    };

    let newArticles = newsItems.map(func(item) { toArticle(item) });
    let reverseNewArticles = newArticles.reverse();

    for (item in reverseNewArticles.values()) {
      news.add(item.id, item);
    };
  };

  func toArticle(dto : NewsItemDTO) : News {
    {
      id = Time.now().toText();
      title = dto.title;
      summary = dto.summary;
      fullContent = dto.content;
      category = parseCategory(dto.category);
      author = dto.author;
      publicationDate = dto.publicationDate;
      imageData = null;
      expiresAt = Time.now() + (7 * 24 * 60 * 60 * 1000000000);
      createdAt = Time.now();
      sourceUrl = dto.sourceUrl;
    };
  };

  func parseCategory(categoryStr : Text) : NewsCategory {
    switch (categoryStr.toLower()) {
      case ("political") { #political };
      case ("movie") { #movie };
      case (_) { #political };
    };
  };

  public query func getNewsById(id : Text) : async News {
    switch (news.get(id)) {
      case (null) {
        Runtime.trap("Article not found.");
      };
      case (?article) {
        if (Time.now() > article.expiresAt) {
          Runtime.trap("Article has expired");
        };
        article;
      };
    };
  };

  func compareNewsByCreatedAtDescending(a : News, b : News) : Order.Order {
    Int.compare(b.createdAt, a.createdAt);
  };

  func compareReviewsByCreatedAt(a : Review, b : Review) : Order.Order {
    Int.compare(b.createdAt, a.createdAt);
  };

  public query func getAllNews() : async [News] {
    let filteredNews = news.values().toArray().filter(
      func(article) {
        Time.now() <= article.expiresAt;
      }
    );

    filteredNews.sort(
      compareNewsByCreatedAtDescending
    );
  };

  public query func getNewsByCategory(category : NewsCategory) : async [News] {
    let filteredNews = news.values().toArray().filter(
      func(article) {
        article.category == category and Time.now() <= article.expiresAt
      }
    );

    filteredNews.sort(
      compareNewsByCreatedAtDescending
    );
  };

  public shared ({ caller }) func addReview(
    articleId : Text,
    reviewerName : Text,
    rating : Nat,
    reviewText : Text,
  ) : async Nat {
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

  public query func getRecentReviews(limit : Nat) : async [Review] {
    let allReviewsArray = reviews.values().toArray().sort(
      compareReviewsByCreatedAt
    );

    let reviewsArray = if (allReviewsArray.size() <= limit) {
      allReviewsArray;
    } else {
      Array.tabulate(limit, func(i) { allReviewsArray[i] });
    };

    reviewsArray;
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

  public shared ({ caller }) func toggleLiveStatus() : async LiveStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change live status");
    };

    liveStatus := {
      isLive = not liveStatus.isLive;
      startedAt = if (not liveStatus.isLive) { ?Time.now() } else { null };
    };
    liveStatus;
  };

  public query func getLiveStatus() : async LiveStatus {
    liveStatus;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func initializeNewsSources() {
    let sources = [
      {
        name = "Eenadu";
        baseUrl = "https://www.eenadu.net";
        feedUrl = "https://www.eenadu.net/rss";
      },
      {
        name = "Sakshi";
        baseUrl = "https://www.sakshi.com";
        feedUrl = "https://www.sakshi.com/rss";
      },
      {
        name = "Andhra Jyothy";
        baseUrl = "https://www.andhrajyothy.com";
        feedUrl = "https://www.andhrajyothy.com/rss";
      },
      {
        name = "Eenadu RSS";
        baseUrl = "https://www.eenadu.net";
        feedUrl = "https://www.eenadu.net/rss.xml";
      },
      {
        name = "Sakshi Atom";
        baseUrl = "https://www.sakshi.com";
        feedUrl = "https://www.sakshi.com/feed/atom";
      },
    ];

    for (source in sources.values()) {
      newsSources.add(source.name, source);
    };
  };

  public shared ({ caller }) func fetchAndReloadAllNews() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reload content");
    };

    initializeNewsSources();

    for ((sourceName, source) in newsSources.toArray().values()) {
      let fetchedContent = await fetchNewsFromSource(source);
      ignore fetchedContent;
    };
  };

  public shared ({ caller }) func fetchSpecificSource(sourceName : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can fetch specific source content");
    };

    switch (newsSources.get(sourceName)) {
      case (null) { Runtime.trap("Source not found") };
      case (?source) {
        await fetchNewsFromSource(source);
      };
    };
  };

  func fetchNewsFromSource(source : NewsSource) : async Text {
    if (processedUrls.contains(source.feedUrl)) {
      Runtime.trap("URL already processed, skipping fetch");
    };

    processedUrls.add(source.feedUrl);
    await OutCall.httpGetRequest(source.feedUrl, [], transform);
  };
};
