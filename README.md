# document-classifier

Это не классический README о проекте, а просто запись мыслей и план дальнийших действий.

## Этап 1. Клонирование существующей программы

На данный момент реализован алгоритм классификации, что был в моей курсовой работе, с некоторыми поправками на usability.

Алгоритм имеет такой поток выполнения:

* __Этап подготовки данных__
* Программа внутри каждой папки случайным образом разделяет документы на 2 кучи: классифицированные и те, что необходимо распознать.
Сейчас это разбиение составляет 80% и 20% соответственно;
* По всем известным документам строится словарь уникальных слов (обычный `HashMap`);
* Для каждой папки документов получаем маски этих самых папок с помощью словаря;
Маска представляет из себя (большой массив из `0` и `1`, где `0` – слова нет в словаре и `1`, если оно там есть). За позиции
слов в маске отвечает сам словарь;
* По каждой маске строится нейрон;
* __Этап классификации__
* Для каждого нераспознанного документа создается маска
* Каждая маска тестируется на всех нейронах
* Документ принадлежит тому типу нейрона, который распознает документ сильнее всего
* По этим данным собирается статистика

На данный момент качество классификации нейронов плохое:
<img src="https://i.imgur.com/deUJZc5.png" width=600/>

На это есть множество причин. Перечислю:
* Словарь содержит очень много мусорных слов, к примеру: `gfk jta vpd isc rit`.  
  Это какие-то слова в шапке письма, разбитый на части адрес почты и т.д. Уровень классификации на данных "без мусора" ожидается лучше.
  Возможно, стоит фильтровать слова через словарь настоящих английских слов. А, может, совсем перейти на такой словарь и не подсчитывать
  по документам.
* Все слова сейчас имеют одинаковый вес. Однако, есть часто встрчающиеся слова: `in I is the...`, а есть специфичные для данного текста.
Однако, отбразывать междометия, мне кажется, не совсем правильно, они также влияют на стиль письма. Нужно просто каждой группе слов задать
свой вес. Возможно, учитывать количество используемых слов.
* На данный момент нейроны имеют алгоритм обучения, но при этом он не используется. Думаю, правильным решением будет дополнительно
разбить классифицированные документы на 2 части, по одной строить словарь, для другой запускать алгоритм обучения на созданном словаре
* __Контекст__. Диплом называется: "Классификация документов с использованием контекста". Так что нужно подумать, как его сюда прикрутить.

_Дополнительно_:
* сделать нормальное цветное логгирование событий
* высчитать сложность алгоритма и придумать способ оптимизации
* запустить паука по РИНЦ, поскачивать документы и классифицировать их по УДК (но это когда будет ну сооовсем нечем себя занять)
* продумать возможность сохранения данных нейронов
