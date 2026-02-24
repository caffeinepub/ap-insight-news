import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";

actor {
  type NewsCategory = {
    #political;
    #movie;
  };

  type News = {
    id : Text;
    title : Text;
    summary : Text;
    fullContent : Text;
    category : NewsCategory;
    author : Text;
    publicationDate : Text;
    imageUrl : ?Text;
  };

  let news = Map.empty<Text, News>();

  public shared ({ caller }) func addNews(id : Text, title : Text, summary : Text, fullContent : Text, category : NewsCategory, author : Text, publicationDate : Text, imageUrl : ?Text) : async () {
    if (news.containsKey(id)) { Runtime.trap("Article with this ID already exists. ") };

    let article : News = {
      id;
      title;
      summary;
      fullContent;
      category;
      author;
      publicationDate;
      imageUrl;
    };

    news.add(id, article);
  };

  public query ({ caller }) func getNewsById(id : Text) : async News {
    switch (news.get(id)) {
      case (null) { Runtime.trap("Article not found. ") };
      case (?article) { article };
    };
  };

  public query ({ caller }) func getAllNews() : async [News] {
    news.values().toArray();
  };

  public query ({ caller }) func getNewsByCategory(category : NewsCategory) : async [News] {
    news.values().toArray().filter(
      func(article) {
        article.category == category;
      }
    );
  };
};

