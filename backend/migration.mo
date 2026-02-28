import Map "mo:core/Map";
import Set "mo:core/Set";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

module {
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

  public type LiveStatus = {
    isLive : Bool;
    startedAt : ?Time.Time;
  };

  public type NewsSource = {
    name : Text;
    baseUrl : Text;
    feedUrl : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  public type OldNews = {
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
  };

  public type OldActor = {
    news : Map.Map<Text, OldNews>;
    reviews : Map.Map<Nat, Review>;
    nextReviewId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    liveStatus : LiveStatus;
  };

  public type NewActor = {
    news : Map.Map<Text, News>;
    reviews : Map.Map<Nat, Review>;
    nextReviewId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    liveStatus : LiveStatus;
    processedUrls : Set.Set<Text>;
    newsSources : Map.Map<Text, NewsSource>;
  };

  public func run(old : OldActor) : NewActor {
    let newNews = old.news.map<Text, OldNews, News>(
      func(_id, oldNews) {
        {
          oldNews with
          sourceUrl = "";
        };
      }
    );

    {
      old with
      news = newNews;
      processedUrls = Set.empty<Text>();
      newsSources = Map.empty<Text, NewsSource>();
    };
  };
};
